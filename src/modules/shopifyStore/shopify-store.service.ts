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
import {
  ProductsTestDocument,
  ProductsTestQuery,
  ProductsTestQueryVariables,
  ThemeInput,
  UpsertStoreDocument,
  UpsertStoreMutation,
  UpsertStoreMutationVariables,
  UpsertThemeDocument,
  UpsertThemeMutation,
  UpsertThemeMutationVariables,
} from "../../graphql/cloudshelf/generated/cloudshelf";
import { createHmac } from "../../utils/hmac";
import { CloudshelfClientFactory } from "../cloudshelfClient/CloudshelfClient";
import { createThemeJob } from "../queue/queues/theme/theme.job.functions";
import { createLocationJob } from "../queue/queues/location/location.job.functions";

export class ShopifyStoreService {
  async upsertStore(domain: string, accessToken: string, scopes: string[]) {
    const em = Container.entityManager.fork();
    const existingStore = await this.findStoreByDomain(domain);
    let storefrontAccessToken: string | null = null;
    let newStore = false;

    if (!existingStore) {
      storefrontAccessToken = await this.createAccessTokenIfNeeded(
        domain,
        accessToken,
      );
      const store = new ShopifyStore();
      store.domain = domain;
      store.accessToken = accessToken;
      store.storefrontToken = storefrontAccessToken;
      store.scopes = scopes;
      await em.upsert(ShopifyStore, store);
      await em.flush();
      newStore = true;
    } else {
      //Ensure that we keep an upto date access token for the store
      existingStore.accessToken = accessToken;
      existingStore.scopes = scopes;
      await em.upsert(ShopifyStore, existingStore);
      await em.flush();
    }

    //report token to Cloudshelf API
    const timestamp = new Date().getTime().toString();
    const mutationTuple = await CloudshelfClientFactory.getClient().mutate<
      UpsertStoreMutation,
      UpsertStoreMutationVariables
    >({
      mutation: UpsertStoreDocument,
      variables: {
        input: {
          domain,
          accessToken,
          storefrontAccessToken,
          scopes,
        },
        hmac: createHmac(accessToken, timestamp),
        nonce: timestamp,
      },
    });

    if (mutationTuple.errors || !mutationTuple.data) {
      console.log("Failed to create store in cloudshelf");
    }

    if (newStore) {
      await createThemeJob(domain);
      await createLocationJob(domain);
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

  async getThemeFromShopify(domain: string) {
    const client = new ShopifyStorefrontClient(domain);
    const apollo = await client.apollo();
    if (!apollo) {
      return null;
    }
    const query = await apollo.query<
      GetThemeInformationQuery,
      GetThemeInformationQueryVariables
    >({
      query: GetThemeInformationDocument,
    });

    return query.data.shop ?? null;
  }

  async upsertThemeToCloudshelf(domain: string, input: ThemeInput) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      UpsertThemeMutation,
      UpsertThemeMutationVariables
    >({
      mutation: UpsertThemeDocument,
      variables: {
        input,
      },
    });

    //TODO: Handle errors
  }
}
