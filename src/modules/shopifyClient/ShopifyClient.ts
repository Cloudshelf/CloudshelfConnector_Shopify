import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { container } from "tsyringe";
import { ShopifyStoreService } from "../shopifyStore/shopify-store.service";
import { PostgreSqlMikroORM } from "@mikro-orm/postgresql/PostgreSqlMikroORM";

export class ShopifyClient {
  private readonly domain: string;
  constructor(domain: string) {
    this.domain = domain;
  }

  async apollo(orm: PostgreSqlMikroORM) {
    const shopifyStoreService = container.resolve(ShopifyStoreService);
    const store = await shopifyStoreService.findStoreByDomain(orm, this.domain);
    if (!store) {
      return null;
    }
    return new ApolloClient({
      uri: `https://${this.domain}/admin/api/2022-10/graphql.json`,
      cache: new InMemoryCache(),
      // Header
      headers: {
        "X-Shopify-Access-Token": store.accessToken,
      },
    });
  }
}
