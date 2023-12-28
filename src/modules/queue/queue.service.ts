import { createClient, RedisClientType } from "redis";
import {
  DelayedError,
  Job,
  JobsOptions,
  Processor,
  Queue,
  UnrecoverableError,
  Worker,
} from "bullmq";
import { QueueNames } from "./queue.names.const";
import differenceInHours from "date-fns/differenceInHours";
import { Container } from "../../container";
import { snakeToSentence } from "../../utils/format";
import { differenceInMinutes, formatDistance } from "date-fns";
import { inspect } from "util";

const WARNING_AGE_IN_HOURS = 2;
const SEVERE_AGE_IN_HOURS = 4;
const COMPLETION_RATIO_DEGRADED = 0.75;
const COMPLETION_RATIO_CRITICAL = 0.25;

export class QueueService {
  // Redis client
  private redis: RedisClientType;
  private readonly queues: { [key: string]: Queue };
  private readonly workers: { [key: string]: Worker };

  constructor() {
    this.redis = createClient({
      url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      pingInterval: 10000, //10 secs
    });
    void this.redis.connect();
    this.queues = {};
    this.workers = {};
  }

  async registerQueue(
    queueName: QueueNames,
    processor: Processor,
    concurrency = 1,
    attempts = 10,
  ): Promise<void> {
    const queue = new Queue(queueName, {
      connection: {
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!),
        username: process.env.REDIS_USERNAME!,
        password: process.env.REDIS_PASSWORD!,
      },
      prefix: "noble",
      defaultJobOptions: {
        // TODO: Tweak these values if necessary
        attempts,
        backoff: {
          type: "fixed",
          delay: 10000,
        },
      },
    });
    const worker = new Worker(
      queueName,
      async (job, token) => {
        if (job.data.lockId) {
          const lockAcquired = await this.acquireLock(job.data.lockId);
          if (!lockAcquired) {
            // Another job is running for this store, skip processing
            await job.moveToDelayed(Date.now() + 500, token);
            throw new DelayedError();
            return;
          }
          console.log(
            `Lock definitely acquired for job '${job.name}:${job.id}', lockId: ${job.data.lockId}`,
          );
        }

        let res: any = null;
        try {
          res = await processor(job);
        } catch (ex) {
          if (ex instanceof DelayedError) {
            console.log("Job was delayed");
            // console.log(
            //   `Releasing lock for job '${job.name}:${job.id}', lockId: ${job.data.lockId}`,
            // );
            // await this.releaseLock(job.data.lockId);
            throw ex;
          }
          console.log(
            "Error processing job",
            JSON.stringify(ex, Object.getOwnPropertyNames(ex), 2),
          );
          const failCount = job.data.failCount || 0;
          await job.updateData({
            ...job.data,
            failCount: failCount + 1,
          });
          const maxFailAttempts = job.opts.attempts || attempts;
          if (failCount >= maxFailAttempts) {
            throw new UnrecoverableError(
              `Unable to process job. Failed ${failCount} times, out of a maximum of ${maxFailAttempts} times. Latest error: ${inspect(
                ex,
              )}`,
            );
          }

          throw ex;
          // const failCount = job.data.failCount || 0;
          // await job.updateData({ ...job.data, failCount: failCount + 1 });
          // if (failCount < attempts) {
          //   await job.retry();
          // }
          // if (job.data.lockId) {
          //   console.log(
          //     `Releasing lock for job '${job.name}:${job.id}', lockId: ${job.data.lockId}`,
          //   );
          //   await this.releaseLock(job.data.lockId);
          // }
        } finally {
          if (job.data.lockId) {
            console.log(
              `Releasing lock for job '${job.name}:${job.id}', lockId: ${job.data.lockId}`,
            );
            await this.releaseLock(job.data.lockId);
          }
        }

        return res;
      },
      {
        connection: {
          host: process.env.REDIS_HOST!,
          port: parseInt(process.env.REDIS_PORT!),
          username: process.env.REDIS_USERNAME!,
          password: process.env.REDIS_PASSWORD!,
        },
        prefix: "noble",
        concurrency,
        removeOnComplete: { count: 100 }, // Keep the last 100 completed jobs
      },
    );
    this.queues[queueName] = queue;
    this.workers[queueName] = worker;

    console.debug(
      `Registered queue ${queueName}, with {concurrency:${concurrency}, attempts:${attempts}}`,
    );
  }

  async acquireLock(id: string) {
    const lockAcquired = await this.redis.set(`lock:${id}`, "1", {
      EX: 1800,
      NX: true,
    });
    return !!lockAcquired;
  }

  async releaseLock(id: string) {
    await this.redis.del(`lock:${id}`);
  }

  async addJob<T>(queueName: string, data?: T, options?: JobsOptions) {
    const queue = this.queues[queueName];
    await queue.add(queueName, data, options);
  }

  async findJobForDomain<T>(
    queueName: string,
    domain: string,
  ): Promise<Job<T>> {
    console.log(
      "findJobForDomainAndQueue",
      queueName,
      domain,
      "existing queues:" + inspect(this.queues),
    );

    const queue = this.queues[queueName];

    const allPendingJobs = await queue.getJobs([
      "waiting",
      "delayed",
      "prioritized",
    ]);
    const pendingJobs = allPendingJobs.filter(
      (job) => job.data.domain === domain,
    );

    if (pendingJobs.length > 1) {
      console.error(
        `More than one existing job for queue '${queueName}' job found for domain '${domain}'. This should not happen, cancelling all but one job.`,
      );
      await Promise.all(
        pendingJobs.map(async (job, index) => {
          if (index > 0) {
            await job.remove();
          }
        }),
      );
    }

    return pendingJobs[0];
  }

  async checkQueueHealth(queueName: string) {
    const warnings: string[] = [];
    const severeAlerts: string[] = [];

    const queue = this.queues[queueName];

    // Check number & age of waiting jobs
    let waitingJobs = await queue.getJobs([
      "waiting",
      "delayed",
      "prioritized",
    ]);
    waitingJobs = waitingJobs
      .sort((a, b) => {
        if (a.timestamp < b.timestamp) {
          return -1;
        } else if (a.timestamp > b.timestamp) {
          return 1;
        } else {
          return 0;
        }
      })
      .filter((j) => !isNaN(j.timestamp));
    if (waitingJobs.length > 0) {
      const oldestJob = waitingJobs[0];
      const date = new Date(oldestJob.timestamp);
      const diff = differenceInHours(new Date(), date);
      const alert = `Queue has *${
        waitingJobs.length
      }* waiting jobs, the oldest of which is *${formatDistance(
        new Date(),
        date,
      )}* old`;

      if (diff > SEVERE_AGE_IN_HOURS) {
        severeAlerts.push(alert);
      } else if (diff > WARNING_AGE_IN_HOURS) {
        warnings.push(alert);
      }
    }

    // Check recent job completion rate
    const allJobs = await queue.getJobs();
    const recentJobs = allJobs.filter(
      (j) =>
        !isNaN(j.timestamp) &&
        differenceInMinutes(new Date(), new Date(j.timestamp)) <= 90 &&
        differenceInMinutes(new Date(), new Date(j.timestamp)) >= 30,
    );
    if (recentJobs.length > 0) {
      const completedRecentJobs = recentJobs.filter((j) => !!j.finishedOn);
      const ratio = completedRecentJobs.length / recentJobs.length;
      const alert = `Recent job completion rate is ${(100 * ratio).toFixed(
        0,
      )}%`;
      if (ratio < COMPLETION_RATIO_CRITICAL) {
        severeAlerts.push(alert);
      } else if (ratio < COMPLETION_RATIO_DEGRADED) {
        warnings.push(alert);
      }
    }

    // Send slack alerts if necessary
    const slackService = Container.slackService;
    if (warnings.length > 0) {
      await slackService.sendQueueHealthStatus(
        snakeToSentence(queueName),
        warnings,
        "warn",
      );
    }
    if (severeAlerts.length > 0) {
      await slackService.sendQueueHealthStatus(
        snakeToSentence(queueName),
        severeAlerts,
        "critical",
      );
    }
  }

  async checkSyncHealth() {
    // const warnings: string[] = [];
    const severeAlerts: string[] = [];
    const stores = await Container.shopifyStoreService.getAllStores();

    for (const store of stores) {
      const parts: string[] = [];
      if (store.lastProductSync === null) {
        parts.push("products");
      }

      if (store.lastProductGroupSync === null) {
        parts.push("product groups");
      }

      if (store.lastProductSync !== null) {
        const diffInHours = differenceInHours(
          new Date(),
          new Date(store.lastProductSync),
        );

        if (diffInHours >= 28) {
          parts.push("products");
        }
      }

      if (store.lastProductGroupSync !== null) {
        const diffInHours = differenceInHours(
          new Date(),
          new Date(store.lastProductGroupSync),
        );

        if (diffInHours >= 28) {
          parts.push("product groups");
        }
      }

      if (parts.length > 0) {
        severeAlerts.push(
          `${store.domain} has not synced ${parts.join(
            " and ",
          )} in the last 24 hours`,
        );
      }
    }

    if (severeAlerts.length > 0) {
      await Container.slackService.sendSyncHealthStatus(
        severeAlerts,
        "critical",
      );
    }

    // const groupQueue = this.queues[QueueNames.PRODUCT_GROUP_PROCESSOR];
    // const productQueue = this.queues[QueueNames.PRODUCT_PROCESSOR];
    // const completedProductSyncs = (await productQueue.getCompleted()).filter(
    //   (job) =>
    //     job.finishedOn &&
    //     differenceInHours(new Date(), new Date(job.finishedOn)) <= 28,
    // );
    // const completedProductGroupSyncs = (await groupQueue.getCompleted()).filter(
    //   (job) =>
    //     job.finishedOn &&
    //     differenceInHours(new Date(), new Date(job.finishedOn)) <= 28,
    // );
    //
    // for (const store of stores) {
    //   const productSync = completedProductSyncs.find(
    //     (job) => job.data.domain === store.domain,
    //   );
    //   const productGroupSync = completedProductGroupSyncs.find(
    //     (job) => job.data.domain === store.domain,
    //   );
    //
    //   if (!productSync && !productGroupSync) {
    //     severeAlerts.push(
    //       `${store.domain} has not synced products OR product groups in the last 24 hours`,
    //     );
    //   } else if (!productSync) {
    //     warnings.push(
    //       `${store.domain} has not synced products in the last 24 hours`,
    //     );
    //   } else if (!productGroupSync) {
    //     warnings.push(
    //       `${store.domain} has not synced product groups in the last 24 hours`,
    //     );
    //   }
    // }

    // if (warnings.length > 0) {
    //   await Container.slackService.sendSyncHealthStatus(warnings, "warn");
    // }
    // if (severeAlerts.length > 0) {
    //   await Container.slackService.sendSyncHealthStatus(
    //     severeAlerts,
    //     "critical",
    //   );
    // }
  }
}
