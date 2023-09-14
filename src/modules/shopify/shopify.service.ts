import { ShopifyApp, shopifyApp } from "@shopify/shopify-app-express";
import { injectable } from "tsyringe";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";
import "@shopify/shopify-api/adapters/node";
import { shopifyApi } from "@shopify/shopify-api";

@injectable()
export class ShopifyService {
  public readonly shopify: ShopifyApp;
  private readonly sessionStorage: MemorySessionStorage;
  constructor() {
    this.sessionStorage = new MemorySessionStorage();
    this.shopify = shopifyApp({
      api: {
        apiKey: process.env.SHOPIFY_API_KEY!,
        apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY!,
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
        hostName: process.env.HOSTNAME!,
      },
      auth: {
        path: "/app/auth",
        callbackPath: "/app/auth/callback",
      },
      webhooks: {
        path: "/app/webhooks",
      },
      exitIframePath: "/app/exitiframe",
      sessionStorage: this.sessionStorage,
    });
  }

  async getSession(id: string) {
    const sessions = this.sessionStorage.findSessionsByShop(
      "cs-connector.myshopify.com",
    );
    console.log("Sessions for store:", await sessions);
    return this.sessionStorage.loadSession(id);
  }
}
