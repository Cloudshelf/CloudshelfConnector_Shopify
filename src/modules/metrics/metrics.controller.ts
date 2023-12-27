import { Controller, Get } from "routing-controllers";
import { QueueNames } from "../queue/queue.names.const";
import { Container } from "../../container";
import { createProductGroupTriggerJob } from "../queue/queues/productgroup/productgroup.job.functions";
import * as Sentry from "@sentry/node";

@Controller("/metrics")
export class MetricsController {
  @Get("/liveness")
  async liveness() {
    return "OK";
  }

  @Get("/health")
  async health() {
    const queueNames = Object.keys(QueueNames);
    Sentry.startTransaction({
      op: "Noble:HealthCheck",
      name: "Noble Health Check",
      data: {
        queueNames: queueNames.join(", "),
      },
    }).finish();

    for (const queueName of queueNames) {
      await Container.queueService.checkQueueHealth(queueName);
    }

    await Container.queueService.checkSyncHealth();

    return "OK";
  }
}
