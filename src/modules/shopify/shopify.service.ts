import { ShopifyApp, shopifyApp } from "@shopify/shopify-app-express";
import { injectable } from "tsyringe";
import { RedisSessionStorage } from "@shopify/shopify-app-session-storage-redis";
import "@shopify/shopify-api/adapters/node";
import { shopifyApi } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

@injectable()
export class ShopifyService {
  public readonly shopify: ShopifyApp;
  private readonly sessionStorage: SessionStorage;
  constructor() {
    this.sessionStorage = RedisSessionStorage.withCredentials(
      process.env.REDIS_HOST!,
      parseInt(process.env.SESSION_DB!),
      process.env.REDIS_USERNAME!,
      process.env.REDIS_PASSWORD!,
      {},
    );

    this.shopify = shopifyApp({
      api: {
        isEmbeddedApp: true,
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
      // @ts-ignore - Shopify's library types do not match...
      sessionStorage: this.sessionStorage,
      useOnlineTokens: false,
    });
  }

  async getSession(id: string) {
    const sessions = this.sessionStorage.findSessionsByShop(
      "cs-connector-store.myshopify.com",
    );
    console.log("Sessions for store:", await sessions);
    return this.sessionStorage.loadSession(id);
  }

  async deleteAllSessions(shop: string) {
    const sessions = await this.sessionStorage.findSessionsByShop(shop);
    for (const session of sessions) {
      await this.sessionStorage.deleteSession(session.id);
    }
  }
}
