import { container, inject, injectable } from "tsyringe";
import { DatabaseService } from "../database/Database";
import { PostgreSqlMikroORM } from "@mikro-orm/postgresql/PostgreSqlMikroORM";
import { ShopifyStore } from "./shopify-store.entity";
import { RequestContext } from "@mikro-orm/core";
import { ShopifyClient } from "../shopifyClient/ShopifyClient";
import {
  GetProductsDocument,
  GetProductsQuery,
  GetProductsQueryVariables,
} from "../../graphql/shopify/generated/shopify";

@injectable()
export class ShopifyStoreService {
  async createStore(
    orm: PostgreSqlMikroORM,
    domain: string,
    accessToken: string,
  ) {
    const em = orm.em.fork();

    const existingStore = await this.findStoreByDomain(orm, domain);

    if (!existingStore) {
      const store = new ShopifyStore();
      store.domain = domain;
      store.accessToken = accessToken;
      await em.upsert(ShopifyStore, store);
      await em.flush();

      await this.getProducts(orm, domain);
    }
  }

  async findStoreByDomain(
    orm: PostgreSqlMikroORM,
    domain: string,
  ): Promise<ShopifyStore | null> {
    const em = orm.em.fork();
    return em.findOne(ShopifyStore, { domain });
  }

  async getProducts(orm: PostgreSqlMikroORM, domain: string) {
    const client = new ShopifyClient(domain);
    const apollo = await client.apollo(orm);
    if (!apollo) {
      return [];
    }
    const query = await apollo.query<
      GetProductsQuery,
      GetProductsQueryVariables
    >({
      query: GetProductsDocument,
    });

    console.log(query.data);
  }
}
