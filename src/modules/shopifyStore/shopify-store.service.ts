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
  CloudshelfInput,
  DeleteProductGroupsDocument,
  DeleteProductGroupsMutation,
  DeleteProductGroupsMutationVariables,
  DeleteProductsDocument,
  DeleteProductsMutation,
  DeleteProductsMutationVariables,
  IsInstallCompletedDocument,
  IsInstallCompletedQuery,
  IsInstallCompletedQueryVariables,
  LocationInput,
  MarkUninstalledDocument,
  MarkUninstalledMutation,
  MarkUninstalledMutationVariables,
  ProductGroupInput,
  ProductInput,
  ProductsTestDocument,
  ProductsTestQuery,
  ProductsTestQueryVariables,
  ProductVariantInput,
  RequestShopifySubscriptionCheckDocument,
  RequestShopifySubscriptionCheckMutation,
  RequestShopifySubscriptionCheckMutationVariables,
  ThemeInput,
  UpdateProductsInProductGroupDocument,
  UpdateProductsInProductGroupMutation,
  UpdateProductsInProductGroupMutationVariables,
  UpsertCloudshelfDocument,
  UpsertCloudshelfMutation,
  UpsertCloudshelfMutationVariables,
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
  UpsertVariantsInput,
} from "../../graphql/cloudshelf/generated/cloudshelf";
import { createHmac } from "../../utils/hmac";
import { CloudshelfClientFactory } from "../cloudshelfClient/CloudshelfClient";
import { createThemeJob } from "../queue/queues/theme/theme.job.functions";
import { createLocationJob } from "../queue/queues/location/location.job.functions";
import { ApolloQueryResult } from "@apollo/client";
import { createProductTriggerJob } from "../queue/queues/product/product.job.functions";
import { Job } from "bullmq";
import { inspect } from "util";

export class ShopifyStoreService {
  async getAllStores(from?: number, limit?: number) {
    const em = Container.entityManager.fork();
    return em.find(ShopifyStore, {}, { limit: limit, offset: from });
  }

  async getAllStoresThatHaveNotSyncedInOneDay() {
    const em = Container.entityManager.fork();
    return em.find(ShopifyStore, {
      $or: [
        {
          lastSafetySync: {
            $lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
          },
        },
        {
          lastSafetySync: null,
        },
      ],
    });
  }

  async markUninstalled(domain: string) {
    //report uninstall to cloudshelf
    const timestamp = new Date().getTime().toString();
    const mutationTuple = await CloudshelfClientFactory.getClient().mutate<
      MarkUninstalledMutation,
      MarkUninstalledMutationVariables
    >({
      mutation: MarkUninstalledDocument,
      variables: {
        input: {
          domain,
        },
        hmac: createHmac(domain, timestamp),
        nonce: timestamp,
      },
    });

    if (mutationTuple.errors || !mutationTuple.data) {
      console.log("Failed to mark store as uninstalled on cloudshelf");
    }
  }

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
      //we only have to queue the theme job if this is a new store, and it will handle the test
      await createThemeJob(domain, true);
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

  async getLocations(domain: string, job?: Job) {
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

      if (query.error) {
        console.log("getLocationsFromShopify query Error: " + query.error);
        if (job) {
          await job.log("Query.Error: " + JSON.stringify(query.error));
        }
      }

      if (query.errors) {
        console.log("getLocationsFromShopify, query errors:" + query.errors);
        if (job) {
          await job.log("Query.Errors: " + JSON.stringify(query.errors));
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

  async getThemeFromShopify(domain: string, job?: Job) {
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

    if (query.error) {
      console.log("getThemeFromShopify, query Error: " + query.error);
      if (job) {
        await job.log("Query.Error: " + JSON.stringify(query.error));
      }
    }

    if (query.errors) {
      console.log("getThemeFromShopify, query errors:" + query.errors);
      if (job) {
        await job.log("Query.Errors: " + JSON.stringify(query.errors));
      }
    }

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
    inputs: UpsertVariantsInput[],
  ) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      UpsertProductVariantsMutation,
      UpsertProductVariantsMutationVariables
    >({
      mutation: UpsertProductVariantsDocument,
      variables: {
        inputs,
      },
    });

    //TODO: Handle errors
  }

  async updateProductGroups(
    domain: string,
    input: ProductGroupInput[],
    log?: (logmessage: string) => Promise<void>,
  ) {
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

    if (mutationTuple.errors) {
      console.log("Failed to update product groups", mutationTuple.errors);
      if (log) {
        await log(
          "Failed to update product groups: " + inspect(mutationTuple.errors),
        );
      }
    }
    //TODO: Handle errors
  }

  async updateProductsInProductGroup(
    domain: string,
    productGroupId: string,
    productIds: string[],
    log?: (logmessage: string) => Promise<void>,
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

    if (mutationTuple.errors) {
      console.log("Failed to update products in group", mutationTuple.errors);
      if (log) {
        await log(
          "Failed to update products in group: " +
            inspect(mutationTuple.errors),
        );
      }
    }
    //TODO: Handle errors
  }

  async deleteProduct(domain: string, productId: string) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      DeleteProductsMutation,
      DeleteProductsMutationVariables
    >({
      mutation: DeleteProductsDocument,
      variables: {
        ids: [productId],
      },
    });

    //TODO: Handle errors
  }

  async deleteProductGroup(domain: string, productGroupId: string) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      DeleteProductGroupsMutation,
      DeleteProductGroupsMutationVariables
    >({
      mutation: DeleteProductGroupsDocument,
      variables: {
        ids: [productGroupId],
      },
    });

    //TODO: Handle errors
  }

  async requestSubscriptionCheck(domain: string, shopifyGid: string) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      RequestShopifySubscriptionCheckMutation,
      RequestShopifySubscriptionCheckMutationVariables
    >({
      mutation: RequestShopifySubscriptionCheckDocument,
      variables: {
        shopifyGid,
      },
    });

    //TODO: Handle errors
  }

  async isStoreFullyInstalled(domain: string) {
    const client = CloudshelfClientFactory.getClient(domain);

    const queryTuple = await client.query<
      IsInstallCompletedQuery,
      IsInstallCompletedQueryVariables
    >({
      query: IsInstallCompletedDocument,
      variables: {
        domain,
      },
    });

    return queryTuple.data.organisationInstallComplete ?? false;
  }

  async upsertCloudshelf(
    domain: string,
    input: CloudshelfInput,
    log?: (logmessage: string) => Promise<void>,
  ) {
    const client = CloudshelfClientFactory.getClient(domain);

    const mutationTuple = await client.mutate<
      UpsertCloudshelfMutation,
      UpsertCloudshelfMutationVariables
    >({
      mutation: UpsertCloudshelfDocument,
      variables: {
        input: [input],
      },
    });

    if (mutationTuple.errors) {
      console.log("Failed to upsert Cloudshelf", mutationTuple.errors);
      if (log) {
        await log(
          "Failed to upsert cloudshelf: " + inspect(mutationTuple.errors),
        );
      }
    }

    //TODO: Handle errors
  }

  async removeFromDatabase(shopDomain: string) {
    const em = Container.entityManager.fork();
    const store = await em.findOne(ShopifyStore, { domain: shopDomain });
    if (store) {
      em.remove(store);
      await em.flush();
    }

    delete Container.customTokens[shopDomain];
  }

  async markAsSafetySyncRequested(stores: ShopifyStore[]) {
    const em = Container.entityManager.fork();

    for (const store of stores) {
      store.lastSafetySync = new Date();
    }

    em.persist(stores);

    await em.flush();
  }

  async updateLastProductSync(domain: string) {
    const em = Container.entityManager.fork();
    const store = await this.findStoreByDomain(domain);

    if (store) {
      store.lastProductSync = new Date();
      em.persist(store);
      await em.flush();
    }
  }

  async updateLastProductGroupSync(domain: string) {
    const em = Container.entityManager.fork();
    const store = await this.findStoreByDomain(domain);

    if (store) {
      store.lastProductGroupSync = new Date();
      em.persist(store);
      await em.flush();
    }
  }
}
