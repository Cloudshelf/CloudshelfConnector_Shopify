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
import { Container } from "../../container";
import { ProductUpdateWebhookPayload } from "./dtos/product-update.webhook.payload";
import { ProductDeleteWebhookPayload } from "./dtos/product-delete.webhook.payload";
import { CollectionUpdateWebhookPayload } from "./dtos/collection-update.webhook.payload";
import { CollectionDeleteWebhookPayload } from "./dtos/collection-delete.webhook.payload";
import { AppSubscriptionUpdateWebhookPayload } from "./dtos/app-subscription-update.webhook.payload";
import { gidBuilder, gidConverter } from "../../utils/gidConverter";
import { createProductTriggerJob } from "../queue/queues/product/product.job.functions";
import { createProductGroupTriggerJob } from "../queue/queues/productgroup/productgroup.job.functions";
import * as Sentry from "@sentry/node";

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

    Sentry.startTransaction({
      op: "Webhook:Received",
      name: "Received store uninstalled webhook",
      data: {
        body: JSON.stringify(body),
        shopDomain,
      },
    }).finish();

    if (!shopDomain) {
      console.error("No shop domain in header");
      return 400;
    }

    await Container.shopifyStoreService.markUninstalled(shopDomain);
    await Container.shopifyService.deleteAllSessions(shopDomain);
    await Container.shopifyStoreService.removeFromDatabase(shopDomain);
    await Container.slackService.sendUninstallNotification(shopDomain);

    return 200;
  }

  ///This is to handle the following webhook:
  ///https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
  @Post("/customer_data_request")
  @HttpCode(200)
  async customerDataRequest(@Req() req: Request, @Body() body: any) {
    console.log("Received store customers/data_request webhook");
    const shopDomain = req.get("x-shopify-shop-domain");

    Sentry.startTransaction({
      op: "Webhook:Received",
      name: "Received store data request webhook",
      data: {
        body,
        shopDomain,
      },
    }).finish();

    if (!shopDomain) {
      console.error("No shop domain in header");
      return 400;
    }

    // We don't have access to customer data,
    // so we don't need to do anything here other than respond.
    return 200;
  }

  ///This is to handle the following webhook:
  ///https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact-payload
  @Post("/customer_redact")
  @HttpCode(200)
  async customerRedact(@Req() req: Request, @Body() body: any) {
    console.log("Received store customers/redact webhook");
    const shopDomain = req.get("x-shopify-shop-domain");

    if (!shopDomain) {
      console.error("No shop domain in header");
      return 400;
    }

    // We don't have access to customer data,
    // so we don't need to do anything here other than respond.
    return 200;
  }

  ///This is to handle the following webhook:
  ///https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact-payload
  @Post("/shop_redact")
  @HttpCode(200)
  async shopRedact(@Req() req: Request, @Body() body: any) {
    console.log("Received shop/redact webhook");
    const shopDomain = req.get("x-shopify-shop-domain");

    Sentry.startTransaction({
      op: "Webhook:Received",
      name: "Received store redact webhook",
      data: {
        body,
        shopDomain,
      },
    }).finish();

    if (!shopDomain) {
      console.error("No shop domain in header");
      return 400;
    }

    // Shopify send this to us 48 hours after a store uninstalls.
    // We have already deleted all the data the connector when then they uninstalled.
    // From here we should now ask the API to also delete all the data we have stored for this store.
    await Container.slackService.sendStoreRedactNotification(shopDomain);
    return 200;
  }

  @Post("/product-update")
  @HttpCode(200)
  async productUpdate(
    @Req() req: Request,
    @Body() body: ProductUpdateWebhookPayload,
  ) {
    console.log("Received product update webhook");
    const shopDomain = req.get("x-shopify-shop-domain");

    Sentry.startTransaction({
      op: "Webhook:Received",
      name: "Received product update webhook",
      data: {
        body,
        shopDomain,
      },
    }).finish();

    if (!shopDomain) {
      console.error("No shop domain in header");
      return 400;
    }

    const productId = gidConverter(
      body.admin_graphql_api_id,
      "ShopifyProduct",
    )!;
    await createProductTriggerJob(shopDomain, [productId], false, true);

    return 200;
  }

  @Post("/product-delete")
  @HttpCode(200)
  async productDelete(
    @Req() req: Request,
    @Body() body: ProductDeleteWebhookPayload,
  ) {
    console.log("Received product delete webhook");
    const shopDomain = req.get("x-shopify-shop-domain");

    Sentry.startTransaction({
      op: "Webhook:Received",
      name: "Received product delete webhook",
      data: {
        body,
        shopDomain,
      },
    }).finish();

    if (!shopDomain) {
      console.error("No shop domain in header");
      return 400;
    }

    const productId = gidBuilder(body.id, "ShopifyProduct")!;
    await Container.shopifyStoreService.deleteProduct(shopDomain, productId);

    return 200;
  }

  @Post("/collection-update")
  @HttpCode(200)
  async collectionUpdate(
    @Req() req: Request,
    @Body() body: CollectionUpdateWebhookPayload,
  ) {
    console.log("Received collection update webhook");
    const shopDomain = req.get("x-shopify-shop-domain");

    Sentry.startTransaction({
      op: "Webhook:Received",
      name: "Received collection update webhook",
      data: {
        body,
        shopDomain,
      },
    }).finish();

    if (!shopDomain) {
      console.error("No shop domain in header");
      return 400;
    }

    const productId = gidConverter(
      body.admin_graphql_api_id,
      "ShopifyCollection",
    )!;
    await createProductGroupTriggerJob(shopDomain, [productId], false, true);

    return 200;
  }

  @Post("/collection-delete")
  @HttpCode(200)
  async collectionDelete(
    @Req() req: Request,
    @Body() body: CollectionDeleteWebhookPayload,
  ) {
    console.log("Received collection delete webhook");
    const shopDomain = req.get("x-shopify-shop-domain");

    Sentry.startTransaction({
      op: "Webhook:Received",
      name: "Received collection delete webhook",
      data: {
        body,
        shopDomain,
      },
    }).finish();

    if (!shopDomain) {
      console.error("No shop domain in header");
      return 400;
    }

    const productGroupId = gidBuilder(body.id, "ShopifyCollection")!;
    await Container.shopifyStoreService.deleteProductGroup(
      shopDomain,
      productGroupId,
    );

    return 200;
  }

  @Post("/app-subscriptions-update")
  @HttpCode(200)
  async appSubscriptionUpdate(
    @Req() req: Request,
    @Body() body: AppSubscriptionUpdateWebhookPayload,
  ) {
    console.log("Received app subscription webhook");
    const shopDomain = req.get("x-shopify-shop-domain");

    Sentry.startTransaction({
      op: "Webhook:Received",
      name: "Received subscription update webhook",
      data: {
        body,
        shopDomain,
      },
    }).finish();

    if (!shopDomain) {
      console.error("No shop domain in header");
      return 400;
    }

    await Container.shopifyStoreService.requestSubscriptionCheck(
      shopDomain,
      body.app_subscription.admin_graphql_api_id,
    );

    return 200;
  }
}
