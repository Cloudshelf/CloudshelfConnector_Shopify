import {
  Body,
  Controller,
  Get,
  HttpCode,
  JsonController,
  Post,
  Req,
  UseBefore,
} from "routing-controllers";
import { WebhookAuthenticationMiddleware } from "../auth/webhook-authentication.middleware";
import { Request } from "express";
import { BulkOperationWebhookPayload } from "../bulkOperation/dtos/bulk-operation.webhook.payload";

@JsonController("/webhooks/shopify-store")
@UseBefore(WebhookAuthenticationMiddleware)
export class ShopifyStoreController {
  constructor() {}

  @Post("/uninstalled")
  @HttpCode(200)
  async uninstalled(
    @Req() req: Request,
    @Body() body: BulkOperationWebhookPayload,
  ) {
    console.log("Received store uninstall webhook");

    const shopDomain = req.get("x-shopify-shop-domain");
    console.error("Need to handle uninstall webhook for store: ", shopDomain);
    return 200;
  }
}
