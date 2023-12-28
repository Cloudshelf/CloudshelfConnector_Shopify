import {
  Body,
  Get,
  HttpCode,
  JsonController,
  Post,
  Req,
} from "routing-controllers";
import { Request } from "express";
import { BulkOperationWebhookPayload } from "../bulkOperation/dtos/bulk-operation.webhook.payload";
import { Container } from "../../container";
import { SafetySyncWebhookPayload } from "./dtos/safety-sync.webhook.payload";
import { createProductGroupTriggerJob } from "./queues/productgroup/productgroup.job.functions";
import { createProductTriggerJob } from "./queues/product/product.job.functions";
import * as Sentry from "@sentry/node";
import { QueueNames } from "./queue.names.const";

@JsonController("/queue")
export class QueueController {
  constructor() {}

  @Post("/bulk-poll-check")
  async bulkOpPollCheck(
    @Body() body: SafetySyncWebhookPayload,
    @Req() req: Request,
  ) {
    console.log("Received request to poll bulk operations");
    if (body.key !== process.env.SAFETY_SYNC_KEY) {
      console.error("Request to poll bulk operations had invalid key");
      return 400;
    }

    Sentry.startTransaction({
      op: "Noble:BulkOp:Poll",
      name: "Poll bulk ops",
    }).finish();

    await Container.bulkOperationService.findPossibleJobsWithNoResultAndPoll();

    return "OK";
  }

  @Post("/safety-sync")
  @HttpCode(200)
  async safetySync(
    @Req() req: Request,
    @Body() body: SafetySyncWebhookPayload,
  ) {
    console.log("Received request to schedule safety syncs");

    if (body.key !== process.env.SAFETY_SYNC_KEY) {
      console.error("Request to schedule safety syncs had invalid key");
      return 400;
    }

    const stores =
      await Container.shopifyStoreService.getAllStoresThatHaveNotSyncedInOneDay();

    console.log(`Found ${stores.length} stores to safety sync`);

    if (stores.length > 0) {
      const storeDomains = stores.map((store) => store.domain).join(", ");
      console.log("Scheduling safety syncs: " + storeDomains);
      Sentry.startTransaction({
        op: "Noble:SafetySync",
        name: "Queued Safety Syncs",
        data: {
          total: stores.length,
          stores: storeDomains,
        },
      }).finish();

      for (const store of stores) {
        await createProductTriggerJob(store.domain, [], false, false);
      }

      await Container.shopifyStoreService.markAsSafetySyncRequested(stores);
    }
    console.log("Finished handling safety sync request");
    return 200;
  }
}
