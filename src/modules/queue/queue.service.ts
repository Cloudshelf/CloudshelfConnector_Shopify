import { injectable } from "tsyringe";
import { createClient, RedisClientType } from "redis";
import { DelayedError, JobsOptions, Processor, Queue, Worker } from "bullmq";
import { QueueNames } from "./queue.names.const";

@injectable()
export class QueueService {
  // Redis client
  private redis: RedisClientType;
  private queues: { [key: string]: Queue };
  private workers: { [key: string]: Worker };

  constructor() {
    this.redis = createClient();
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
          console.log(`Lock definitely acquired for job ${job.data.id}`);
        }
        let res: any = null;
        try {
          res = await processor(job);
        } catch (ex) {
          console.log(
            "Error processing job",
            JSON.stringify(ex, Object.getOwnPropertyNames(ex), 2),
          );
          const failCount = job.data.failCount || 0;
          await job.updateData({ ...job.updateData, failCount: failCount + 1 });
          await job.retry();
          if (job.data.lockId) {
            console.log(`Releasing lock for job ${job.data.id}`);
            await this.releaseLock(job.data.lockId);
          }
        }

        if (job.data.lockId) {
          console.log(`Releasing lock for job ${job.data.id}`);
          await this.releaseLock(job.data.lockId);
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

  async addJob(queueName: string, data?: any, options?: JobsOptions) {
    const queue = this.queues[queueName];
    await queue.add(queueName, data, options);
  }
}
