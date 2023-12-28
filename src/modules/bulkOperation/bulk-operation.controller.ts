import {
  Body,
  Get,
  HttpCode,
  JsonController,
  Post,
  Req,
  UseBefore,
} from "routing-controllers";
import { WebhookAuthenticationMiddleware } from "../auth/webhook-authentication.middleware";
import { BulkOperationWebhookPayload } from "./dtos/bulk-operation.webhook.payload";
import { Container } from "../../container";
import { BulkOperationType } from "./bulk-operation.type";
import { createProductJob } from "../queue/queues/product/product.job.functions";
import { createProductGroupJob } from "../queue/queues/productgroup/productgroup.job.functions";
import { Request } from "express";
import * as Sentry from "@sentry/node";
import { QueueNames } from "../queue/queue.names.const";

@JsonController("/webhooks/bulkoperation")
@UseBefore(WebhookAuthenticationMiddleware)
export class BulkOperationController {
  constructor() {}

  @Post("/complete")
  @HttpCode(200)
  async complete(
    @Req() req: Request,
    @Body() body: BulkOperationWebhookPayload,
  ) {
    const shopDomain = req.get("x-shopify-shop-domain");
    const topic = req.get("x-shopify-topic");

    Sentry.startTransaction({
      op: "Webhook:Received",
      name: "Received bulkOpComplete webhook",
      data: {
        body,
        shopDomain,
      },
    }).finish();
    console.log("Received bulkOpComplete webhook");

    if (!shopDomain || !topic) {
      console.log("bulkOpComplete webhook had invalid headers");
      return 200;
    }

    if (!body.admin_graphql_api_id) {
      console.log("bulkOpComplete webhook had invalid body");
      return 200;
    }
    const bulkOp = await Container.bulkOperationService.findOneByShopifyId(
      body.admin_graphql_api_id,
    );

    if (!bulkOp) {
      console.log("bulkOpComplete webhook referenced unknown bulkOp");
      return 200;
    }

    const store = await Container.shopifyStoreService.findStoreByDomain(
      shopDomain,
    );

    if (!store) {
      console.log("bulkOpComplete webhook referenced unknown store");
      return 200;
    }

    //get data from shopify
    const shopifyData =
      await Container.bulkOperationService.getBulkOperationInformationFromShopifyById(
        shopDomain,
        bulkOp.shopifyBulkOpId,
      );

    if (!shopifyData) {
      console.log(
        "bulkOpComplete webhook provided known shopify id but shopify could not find it",
      );
      return 200;
    }

    bulkOp.dataUrl = shopifyData.url;
    bulkOp.startedAt = shopifyData.createdAt
      ? new Date(shopifyData.createdAt)
      : null;
    bulkOp.endedAt = shopifyData.completedAt
      ? new Date(shopifyData.completedAt)
      : null;
    bulkOp.status = shopifyData.status ?? "UNKNOWN";

    console.log("Attempting to update bulkOp record");
    await Container.bulkOperationService.saveOne(bulkOp);
    console.log("Successfully updated bulkOp record");

    if (bulkOp.status.toLowerCase() === "completed") {
      await Container.bulkOperationService.handleBulkOpChange(
        bulkOp,
        bulkOp.domain,
        "webhook",
      );
    }

    return 200;
  }
}
