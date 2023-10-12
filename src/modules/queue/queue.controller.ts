import { Body, HttpCode, JsonController, Post, Req } from "routing-controllers";
import { Request } from "express";
import { BulkOperationWebhookPayload } from "../bulkOperation/dtos/bulk-operation.webhook.payload";
import { Container } from "../../container";
import { SafetySyncWebhookPayload } from "./dtos/safety-sync.webhook.payload";
import { createProductGroupTriggerJob } from "./queues/productgroup/productgroup.job.functions";
import { createProductTriggerJob } from "./queues/product/product.job.functions";

@JsonController("/queue")
export class QueueController {
  constructor() {}

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

    const stores = await Container.shopifyStoreService.getAllStores();

    for (const store of stores) {
      await createProductTriggerJob(store.domain, [], false, false);
    }

    return 200;
  }
}
