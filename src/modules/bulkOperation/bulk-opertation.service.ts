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
import { Job } from "bullmq";
import { jobLog } from "../../utils/jobLog";
import { createProductJob } from "../queue/queues/product/product.job.functions";
import { createProductGroupJob } from "../queue/queues/productgroup/productgroup.job.functions";

export class BulkOperationService {
  async findOneById(id: string): Promise<BulkOperation | null> {
    const em = Container.entityManager.fork();
    return em.findOne(BulkOperation, { id });
  }

  async findOneByShopifyId(shopifyId: string): Promise<BulkOperation | null> {
    const em = Container.entityManager.fork();
    return em.findOne(BulkOperation, { shopifyBulkOpId: shopifyId });
  }

  async createBulkOperation(
    domain: string,
    type: BulkOperationType,
    bulkOperationString: string,
    installStyleSync = false,
    explicitIds?: string[],
    job?: Job,
  ): Promise<BulkOperation> {
    const dataFromShopify = await this.createBulkOperationOnShopify(
      domain,
      bulkOperationString,
      job,
    );

    if (!dataFromShopify) {
      if (job) {
        await jobLog(job, "Failed to create bulk operation on Shopify");
      }
      throw new Error("Failed to create bulk operation on Shopify");
    }

    const internalRecord = await this.createBulkOperationInternalRecord(
      domain,
      dataFromShopify.id,
      type,
      dataFromShopify?.status,
      installStyleSync,
      explicitIds,
    );

    if (job) {
      await jobLog(job, "Created internal record: " + internalRecord.id);
    }
    return internalRecord;
  }

  async createBulkOperationInternalRecord(
    domain: string,
    shopifyId: string,
    type: BulkOperationType,
    status: string,
    installStyleSync = false,
    explicitIds?: string[],
  ): Promise<BulkOperation> {
    const em = Container.entityManager.fork();

    const bulkOperation = new BulkOperation();
    bulkOperation.shopifyBulkOpId = shopifyId;
    bulkOperation.domain = domain;
    bulkOperation.status = status;
    bulkOperation.type = type;
    bulkOperation.explicitIds = explicitIds ?? [];
    bulkOperation.installStyleSync = installStyleSync;

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
    job?: Job,
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

    if (mutationResult.errors) {
      console.error(
        "Create Bulk Operation Mutation on Shopify returned errors",
        mutationResult.errors,
      );

      if (job) {
        await jobLog(
          job,
          "Create Bulk Operation Mutation on Shopify returned errors:" +
            JSON.stringify(mutationResult.errors),
        );
      }
    }

    return mutationResult.data?.bulkOperationRunQuery?.bulkOperation;
  }

  async findPossibleJobsWithNoResultAndPoll(): Promise<BulkOperation[]> {
    const result: BulkOperation[] = [];
    const em = Container.entityManager.fork();

    //find all that have no ended_at and that are at least 5 minutes old
    const bulkOps = await em.find(BulkOperation, {
      endedAt: { $eq: null },
      createdAt: {
        $lte: new Date(new Date().getTime() - 5 * 60 * 1000),
      },
    });

    console.log(
      "Found " +
        bulkOps.length +
        " bulk operations that are at least 5 minutes old and have no ended_at",
    );

    for (const bulkOp of bulkOps) {
      const shopifyData = await this.getBulkOperationInformationFromShopifyById(
        bulkOp.domain,
        bulkOp.shopifyBulkOpId,
      );

      if (shopifyData) {
        bulkOp.dataUrl = shopifyData.url;
        bulkOp.startedAt = shopifyData.createdAt
          ? new Date(shopifyData.createdAt)
          : null;
        bulkOp.endedAt = shopifyData.completedAt
          ? new Date(shopifyData.completedAt)
          : null;
        bulkOp.status = shopifyData.status ?? "UNKNOWN";
      }
    }

    em.persist(bulkOps);
    await em.flush();

    for (const bulkOp of bulkOps) {
      if (bulkOp.status.toLowerCase() === "completed") {
        await this.handleBulkOpChange(bulkOp, bulkOp.domain, "poll");
      }
    }
    return result;
  }

  async handleBulkOpChange(
    bulkOp: BulkOperation,
    shopDomain: string,
    from: "webhook" | "poll",
  ) {
    //create any required background jobs
    if (bulkOp.type === BulkOperationType.ProductSync) {
      console.log(
        `Creating product sync background task from bulkOpComplete ${from}`,
      );
      await createProductJob(
        shopDomain,
        bulkOp.id,
        bulkOp.explicitIds ?? [],
        bulkOp.installStyleSync,
      );
    } else if (bulkOp.type === BulkOperationType.ProductGroupSync) {
      console.log(
        `Creating product group sync background task from bulkOpComplete ${from}`,
      );
      await createProductGroupJob(
        shopDomain,
        bulkOp.id,
        bulkOp.explicitIds ?? [],
        bulkOp.installStyleSync,
      );
    } else {
      console.log(`bulkOpComplete ${from} referenced unknown bulkOp type`);
    }
  }
}
