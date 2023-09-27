import { container, inject, injectable } from "tsyringe";
import { DatabaseService } from "../database/Database";
import { PostgreSqlMikroORM } from "@mikro-orm/postgresql/PostgreSqlMikroORM";
import { ShopifyStore } from "./shopify-store.entity";
import { RequestContext } from "@mikro-orm/core";
import { ShopifyAdminClient } from "../shopifyClient/ShopifyAdminClient";
import {
  CreateStorefrontAccessTokenDocument,
  CreateStorefrontAccessTokenMutation,
  CreateStorefrontAccessTokenMutationVariables,
  GetProductsDocument,
  GetProductsQuery,
  GetProductsQueryVariables,
  GetStorefrontAccessTokensDocument,
  GetStorefrontAccessTokensQuery,
  GetStorefrontAccessTokensQueryVariables
} from "../../graphql/shopifyAdmin/generated/shopifyAdmin";
import {ShopifyStorefrontClient} from "../shopifyClient/ShopifyStorefrontClient";
import {
  GetThemeInformationDocument,
  GetThemeInformationQuery,
  GetThemeInformationQueryVariables
} from "../../graphql/shopifyStorefront/generated/shopifyStorefront";

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
    const client = new ShopifyAdminClient(domain);
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

  async createAccessTokenIfNeeded(orm: PostgreSqlMikroORM, domain: string) {
    const client = new ShopifyStorefrontClient(domain);
    const apollo = await client.apollo(orm);
    if(!apollo) {
      throw new Error('No apollo client');
    }

    const query = await apollo.query<
        GetStorefrontAccessTokensQuery,
        GetStorefrontAccessTokensQueryVariables
    >({
      query: GetStorefrontAccessTokensDocument,
    });

    const existingAccessTokens = query.data.shop.storefrontAccessTokens.edges ?? [];

    const cloudshelfAccessToken = existingAccessTokens.find((existingToken) => existingToken.node.title === 'Cloudshelf')?.node;

    if(cloudshelfAccessToken) {
      return cloudshelfAccessToken.accessToken;
    } else {
        const newAccessToken = await apollo.mutate<
            CreateStorefrontAccessTokenMutation,
            CreateStorefrontAccessTokenMutationVariables
        >({
            mutation: CreateStorefrontAccessTokenDocument,
              variables: {
                input: {
                    title: 'Cloudshelf'
                }
              }
        });

        if(!newAccessToken.data?.storefrontAccessTokenCreate?.storefrontAccessToken){
          throw new Error('Could not create access token');
        }
        else {
            return newAccessToken.data.storefrontAccessTokenCreate.storefrontAccessToken.accessToken;
        }
    }
  }

  async getTheme(orm: PostgreSqlMikroORM, domain: string) {
    const client = new ShopifyStorefrontClient(domain);
    const apollo = await client.apollo(orm);
    if (!apollo) {
      return [];
    }
    const query = await apollo.query<
      GetThemeInformationQuery,
      GetThemeInformationQueryVariables
    >({
      query: GetThemeInformationDocument,
    });

    console.log(query.data);
  }
}
