import { Container } from "../../container";
import { BulkOperation } from "./bulk-operation.entity";
import { BulkOperationType } from "./bulk-operation.type";
import { ShopifyStorefrontClient } from "../shopifyClient/ShopifyStorefrontClient";
import {
  GetThemeInformationDocument,
  GetThemeInformationQuery,
  GetThemeInformationQueryVariables,
} from "../../graphql/shopifyStorefront/generated/shopifyStorefront";
import {
  BulkOperationByShopifyIdDocument,
  BulkOperationByShopifyIdQuery,
  BulkOperationByShopifyIdQueryVariables,
  CreateShopifyBulkOperationDocument,
  CreateShopifyBulkOperationMutation,
  CreateShopifyBulkOperationMutationVariables,
} from "../../graphql/shopifyAdmin/generated/shopifyAdmin";
import { ShopifyAdminClient } from "../shopifyClient/ShopifyAdminClient";

export class BulkOperationService {
  async findOneByShopifyId(shopifyId: string): Promise<BulkOperation | null> {
    const em = Container.entityManager.fork();
    return em.findOne(BulkOperation, { shopifyBulkOpId: shopifyId });
  }

  async createBulkOperation(
    domain: string,
    type: BulkOperationType,
    bulkOperationString: string,
    explicitIds?: string[],
  ): Promise<BulkOperation> {
    const dataFromShopify = await this.createBulkOperationOnShopify(
      domain,
      bulkOperationString,
    );

    if (!dataFromShopify) {
      throw new Error("Failed to create bulk operation on Shopify");
    }

    const internalRecord = await this.createBulkOperationInternalRecord(
      domain,
      dataFromShopify.id,
      type,
      dataFromShopify?.status,
      explicitIds,
    );

    return internalRecord;
  }

  async createBulkOperationInternalRecord(
    domain: string,
    shopifyId: string,
    type: BulkOperationType,
    status: string,
    explicitIds?: string[],
  ): Promise<BulkOperation> {
    const em = Container.entityManager.fork();

    const bulkOperation = new BulkOperation();
    bulkOperation.shopifyBulkOpId = shopifyId;
    bulkOperation.domain = domain;
    bulkOperation.status = status;
    bulkOperation.type = type;
    bulkOperation.explicitIds = explicitIds ?? [];

    await em.upsert(BulkOperation, bulkOperation);
    return bulkOperation;
  }

  async saveOne(bulkOperation: BulkOperation): Promise<BulkOperation> {
    const em = Container.entityManager.fork();
    await em.upsert(BulkOperation, bulkOperation);
    return bulkOperation;
  }

  async getBulkOperationInformationFromShopifyById(
    domain: string,
    shopifyId: string,
  ) {
    const client = new ShopifyAdminClient(domain);
    const apollo = await client.apollo();
    if (!apollo) {
      return null;
    }
    const query = await apollo.query<
      BulkOperationByShopifyIdQuery,
      BulkOperationByShopifyIdQueryVariables
    >({
      query: BulkOperationByShopifyIdDocument,
      variables: {
        nodeId: shopifyId,
      },
    });

    if (query.data.node?.__typename !== "BulkOperation") {
      return null;
    }
    return query.data.node;
  }

  async createBulkOperationOnShopify(
    domain: string,
    bulkOperationString: string,
  ) {
    const client = new ShopifyAdminClient(domain);
    const apollo = await client.apollo();
    if (!apollo) {
      return null;
    }

    const mutationResult = await apollo.mutate<
      CreateShopifyBulkOperationMutation,
      CreateShopifyBulkOperationMutationVariables
    >({
      mutation: CreateShopifyBulkOperationDocument,
      variables: {
        queryString: bulkOperationString,
      },
    });

    return mutationResult.data?.bulkOperationRunQuery?.bulkOperation;
  }
}
