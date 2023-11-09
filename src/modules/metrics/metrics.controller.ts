import { Controller, Get } from "routing-controllers";
import { QueueNames } from "../queue/queue.names.const";
import { Container } from "../../container";
import { createProductGroupTriggerJob } from "../queue/queues/productgroup/productgroup.job.functions";

@Controller("/metrics")
export class MetricsController {
  @Get("/liveness")
  async liveness() {
    return "OK";
  }

  @Get("/health")
  async health() {
    const queueNames = Object.keys(QueueNames);

    for (const queueName of queueNames) {
      await Container.queueService.checkQueueHealth(queueName);
    }

    await Container.queueService.checkSyncHealth();

    return "OK";
  }
}
