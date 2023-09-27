import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client/core";
import { container } from "tsyringe";
import { ShopifyStoreService } from "../shopifyStore/shopify-store.service";
import { PostgreSqlMikroORM } from "@mikro-orm/postgresql/PostgreSqlMikroORM";

export class ShopifyAdminClient {
  private readonly domain: string;
  constructor(domain: string) {
    this.domain = domain;
  }

  async apollo(orm: PostgreSqlMikroORM, forcedStore?: {domain: string, accessToken: string}) {
    let domain = forcedStore?.domain || this.domain;
    let accessToken = forcedStore?.accessToken || null;

    if(!forcedStore) {
      const shopifyStoreService = container.resolve(ShopifyStoreService);
      const store = await shopifyStoreService.findStoreByDomain(orm, this.domain);
      if (!store) {
        return null;
      }
      accessToken = store.accessToken;
    }

    if(!accessToken) {
      return null;
    }

    return new ApolloClient({
      uri: `https://${domain}/admin/api/${process.env.SHOPIFY_API_VERSION!}/graphql.json`,
      cache: new InMemoryCache(),
      // Header
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    });
  }
}
