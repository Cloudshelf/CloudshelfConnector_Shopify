import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client/core";
import { container } from "tsyringe";
import { ShopifyStoreService } from "../shopifyStore/shopify-store.service";
import { PostgreSqlMikroORM } from "@mikro-orm/postgresql/PostgreSqlMikroORM";

export class ShopifyStorefrontClient {
  private readonly domain: string;
  constructor(domain: string) {
    this.domain = domain;
  }

  async apollo(orm: PostgreSqlMikroORM) {
    const shopifyStoreService = container.resolve(ShopifyStoreService);
    const store = await shopifyStoreService.findStoreByDomain(orm, this.domain);
    if (!store || !store.storefrontToken) {
      return null;
    }
    return new ApolloClient({
      uri: `https://${this.domain}/api/${process.env.SHOPIFY_API_VERSION!}/graphql.json`,
      cache: new InMemoryCache(),
      // Header
      headers: {
        "X-Shopify-Storefront-Access-Token": store.storefrontToken,
      },
    });
  }
}
