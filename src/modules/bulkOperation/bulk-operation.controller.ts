import {
  Body,
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

@JsonController("/webhooks/bulkoperation")
@UseBefore(WebhookAuthenticationMiddleware)
export class BulkOperationController {
  constructor() {}

  @Post("/complete")
  @HttpCode(200)
  async test(@Req() req: Request, @Body() body: BulkOperationWebhookPayload) {
    console.log("Received bulkOpComplete webhook");

    const shopDomain = req.get("x-shopify-shop-domain"); //req.headers["x-shopify-shop-domain"] ?? undefined;
    const topic = req.get("x-shopify-topic"); //req.headers["x-shopify-topic"] ?? undefined;

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

    //create any required background jobs
    if (bulkOp.type === BulkOperationType.ProductSync) {
      console.log(
        "Creating product sync background task from bulkOpComplete webhook",
      );
      await createProductJob(shopDomain, bulkOp.id, bulkOp.explicitIds ?? []);
    } else if (bulkOp.type === BulkOperationType.ProductGroupSync) {
      console.log(
        "Creating product group sync background task from bulkOpComplete webhook",
      );
      await createProductGroupJob(
        shopDomain,
        bulkOp.id,
        bulkOp.explicitIds ?? [],
      );
    } else {
      console.log("bulkOpComplete webhook referenced unknown bulkOp type");
    }

    return 200;
  }
}
