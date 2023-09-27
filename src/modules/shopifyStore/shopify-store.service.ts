import { ShopifyStore } from "./shopify-store.entity";
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
  GetStorefrontAccessTokensQueryVariables,
} from "../../graphql/shopifyAdmin/generated/shopifyAdmin";
import { ShopifyStorefrontClient } from "../shopifyClient/ShopifyStorefrontClient";
import {
  GetThemeInformationDocument,
  GetThemeInformationQuery,
  GetThemeInformationQueryVariables,
} from "../../graphql/shopifyStorefront/generated/shopifyStorefront";
import { Container } from "../../container";

export class ShopifyStoreService {
  async createStore(domain: string, accessToken: string) {
    const em = Container.entityManager.fork();
    const existingStore = await this.findStoreByDomain(domain);

    if (!existingStore) {
      const storefrontAccessToken = await this.createAccessTokenIfNeeded(
        domain,
        accessToken,
      );
      const store = new ShopifyStore();
      store.domain = domain;
      store.accessToken = accessToken;
      store.storefrontToken = storefrontAccessToken;
      await em.upsert(ShopifyStore, store);
      await em.flush();

      await this.getProducts(domain);
    }
  }

  async findStoreByDomain(domain: string): Promise<ShopifyStore | null> {
    const em = Container.entityManager.fork();
    return em.findOne(ShopifyStore, { domain });
  }

  async getProducts(domain: string) {
    const client = new ShopifyAdminClient(domain);
    const apollo = await client.apollo();
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

  async createAccessTokenIfNeeded(storeDomain: string, accessToken: string) {
    const client = new ShopifyAdminClient(storeDomain);
    const apollo = await client.apollo({
      domain: storeDomain,
      accessToken,
    });
    if (!apollo) {
      return null;
    }

    const query = await apollo.query<
      GetStorefrontAccessTokensQuery,
      GetStorefrontAccessTokensQueryVariables
    >({
      query: GetStorefrontAccessTokensDocument,
    });

    const existingStorefrontAccessTokens =
      query.data.shop.storefrontAccessTokens.edges ?? [];

    const cloudshelfStorefrontAccessToken = existingStorefrontAccessTokens.find(
      (existingToken) => existingToken.node.title === "Cloudshelf",
    )?.node;

    if (cloudshelfStorefrontAccessToken) {
      console.debug(
        "Found existing storefront token",
        cloudshelfStorefrontAccessToken.accessToken,
      );
      return cloudshelfStorefrontAccessToken.accessToken;
    } else {
      console.debug("No existing storefront token, creating new one");
      const newAccessToken = await apollo.mutate<
        CreateStorefrontAccessTokenMutation,
        CreateStorefrontAccessTokenMutationVariables
      >({
        mutation: CreateStorefrontAccessTokenDocument,
        variables: {
          input: {
            title: "Cloudshelf",
          },
        },
      });

      if (
        !newAccessToken.data?.storefrontAccessTokenCreate?.storefrontAccessToken
      ) {
        return null;
      } else {
        console.debug(
          "Created new storefront token",
          newAccessToken.data.storefrontAccessTokenCreate.storefrontAccessToken
            .accessToken,
        );
        return newAccessToken.data.storefrontAccessTokenCreate
          .storefrontAccessToken.accessToken;
      }
    }
  }

  async getTheme(domain: string) {
    const client = new ShopifyStorefrontClient(domain);
    const apollo = await client.apollo();
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
