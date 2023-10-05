import { ShopifyStore } from "./shopify-store.entity";
import { ShopifyAdminClient } from "../shopifyClient/ShopifyAdminClient";
import {
  CreateStorefrontAccessTokenDocument,
  CreateStorefrontAccessTokenMutation,
  CreateStorefrontAccessTokenMutationVariables,
  GetLocationsDocument,
  GetLocationsQuery,
  GetLocationsQueryVariables,
  GetProductsDocument,
  GetProductsQuery,
  GetProductsQueryVariables,
  GetStorefrontAccessTokensDocument,
  GetStorefrontAccessTokensQuery,
  GetStorefrontAccessTokensQueryVariables,
  LocationDetailsFragment,
} from "../../graphql/shopifyAdmin/generated/shopifyAdmin";
import { ShopifyStorefrontClient } from "../shopifyClient/ShopifyStorefrontClient";
import {
  GetThemeInformationDocument,
  GetThemeInformationQuery,
  GetThemeInformationQueryVariables,
} from "../../graphql/shopifyStorefront/generated/shopifyStorefront";
import { Container } from "../../container";
import {
  LocationInput,
  ProductGroupInput,
  ProductInput,
  ProductsTestDocument,
  ProductsTestQuery,
  ProductsTestQueryVariables,
  ProductVariantInput,
  ThemeInput,
  UpdateProductsInProductGroupDocument,
  UpdateProductsInProductGroupMutation,
  UpdateProductsInProductGroupMutationVariables,
  UpsertLocationsDocument,
  UpsertLocationsMutation,
  UpsertLocationsMutationVariables,
  UpsertProductGroupsDocument,
  UpsertProductGroupsMutation,
  UpsertProductGroupsMutationVariables,
  UpsertProductsDocument,
  UpsertProductsMutation,
  UpsertProductsMutationVariables,
  UpsertProductVariantsDocument,
  UpsertProductVariantsMutation,
  UpsertProductVariantsMutationVariables,
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
import { ApolloQueryResult } from "@apollo/client";
import { createProductTriggerJob } from "../queue/queues/product/product.job.functions";

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
      await createProductTriggerJob(domain, true, []);
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

  async getLocations(domain: string) {
    const client = new ShopifyAdminClient(domain);
    const apollo = await client.apollo();
    if (!apollo) {
      return [];
    }

    let hasNextPage = true;
    let cursor: string | null = null;
    const locationEdges: LocationDetailsFragment[] = [];

    do {
      let query: ApolloQueryResult<GetLocationsQuery>;
      query = await apollo.query<GetLocationsQuery, GetLocationsQueryVariables>(
        {
          query: GetLocationsDocument,
          variables: {
            after: cursor,
          },
        },
      );

      if (query.data.locations.edges) {
        for (const edge of query.data.locations.edges) {
          if (edge?.node) {
            locationEdges.push(edge.node);
          }
        }
      }

      hasNextPage = query.data.locations.pageInfo.hasNextPage;
      cursor = query.data.locations.edges?.slice(-1)[0]?.cursor ?? null;
    } while (hasNextPage);

    return locationEdges;
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

  async upsertLocationsToCloudshelf(domain: string, input: LocationInput[]) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      UpsertLocationsMutation,
      UpsertLocationsMutationVariables
    >({
      mutation: UpsertLocationsDocument,
      variables: {
        input,
      },
    });

    //TODO: Handle errors
  }

  async upsertProductsToCloudshelf(domain: string, input: ProductInput[]) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      UpsertProductsMutation,
      UpsertProductsMutationVariables
    >({
      mutation: UpsertProductsDocument,
      variables: {
        input,
      },
    });

    //TODO: Handle errors
  }

  async upsertProductVariantsToCloudshelf(
    domain: string,
    inputs: ProductVariantInput[],
    productId: string,
  ) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      UpsertProductVariantsMutation,
      UpsertProductVariantsMutationVariables
    >({
      mutation: UpsertProductVariantsDocument,
      variables: {
        inputs,
        productId,
      },
    });

    //TODO: Handle errors
  }

  async updateProductGroups(domain: string, input: ProductGroupInput[]) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      UpsertProductGroupsMutation,
      UpsertProductGroupsMutationVariables
    >({
      mutation: UpsertProductGroupsDocument,
      variables: {
        input,
      },
    });

    //TODO: Handle errors
  }

  async updateProductsInProductGroup(
    domain: string,
    productGroupId: string,
    productIds: string[],
  ) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      UpdateProductsInProductGroupMutation,
      UpdateProductsInProductGroupMutationVariables
    >({
      mutation: UpdateProductsInProductGroupDocument,
      variables: {
        productGroupId,
        productIds,
      },
    });

    //TODO: Handle errors
  }
}
