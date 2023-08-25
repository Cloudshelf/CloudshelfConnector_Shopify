import { ShopifyApp, shopifyApp } from "@shopify/shopify-app-express";
import { injectable } from "tsyringe";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

@injectable()
export class ShopifyService {
  public readonly shopify: ShopifyApp;
  constructor() {
    this.shopify = shopifyApp({
      api: {
        apiKey: "5b9fc2160c647e271c1c549f6470bea1",
        apiSecretKey: "f719dfa8c715421617b9ac87d6527925",
        scopes: [
          "unauthenticated_read_product_listings",
          "unauthenticated_read_product_tags",
          "unauthenticated_read_product_inventory",
          "unauthenticated_read_product_pickup_locations",
          "read_orders", // Added in scopes v3
          "unauthenticated_read_checkouts", // Added in scopes v3
          "unauthenticated_write_checkouts", // Added in scopes v3
          //Authenticated Scopes
          "read_inventory",
          "read_locations",
          "read_products",
          "read_themes",
          "read_product_listings",
          "read_discounts",
          "read_marketing_events",
          "read_fulfillments",
          "read_legal_policies",
          "read_locales",
          "read_merchant_managed_fulfillment_orders",
          "read_price_rules",
          "write_discounts",
        ],
        hostScheme: "https",
        hostName: `fountain-jelsoft-incident-mentioned.trycloudflare.com`,
      },
      auth: {
        path: "/app/auth",
        callbackPath: "/app/auth/callback",
      },
      webhooks: {
        path: "/app/webhooks",
      },
      exitIframePath: "/app/exitiframe",
      sessionStorage: new MemorySessionStorage(),
    });
  }
}
