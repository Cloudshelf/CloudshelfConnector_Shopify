import { Job } from "bullmq";
import {
  createProductGroupJob,
  createProductGroupTriggerJob,
} from "./productgroup.job.functions";
import { jobLog } from "../../../../utils/jobLog";
import {
  buildCollectionQueryString,
  buildProductsQueryString,
} from "../../../../graphql/shopifyAdmin/bulk_operations.util";
import { Container } from "../../../../container";
import { BulkOperationType } from "../../../bulkOperation/bulk-operation.type";
import {
  ProductGroupJobData,
  ProductGroupTriggerJobData,
} from "./productgroup.job.data.type";
import { v4 } from "uuid";
import { createWriteStream } from "fs";
import axios from "axios";
import * as stream from "stream";
import { promisify } from "util";
import { readJsonl } from "../../../../utils/readJsonlChunked";
import { gidConverter } from "../../../../utils/gidConverter";
import {
  CloudshelfInput,
  ProductGroupInput,
  ProductVariantInput,
} from "../../../../graphql/cloudshelf/generated/cloudshelf";
const finished = promisify(stream.finished);

export const productGroupTriggerQueueProcessor = async (
  job: Job<ProductGroupTriggerJobData>,
): Promise<void> => {
  await jobLog(job, "productGroupTriggerQueueProcessor Started");

  const withPublicationStatus = true;

  const bulkOperationString = buildCollectionQueryString(
    job.data.groupIds,
    withPublicationStatus,
  );

  const bulkOp = await Container.bulkOperationService.createBulkOperation(
    job,
    job.data.domain,
    BulkOperationType.ProductGroupSync,
    bulkOperationString,
    job.data.installStyleSync ?? false,
    job.data.groupIds,
  );

  await jobLog(
    job,
    "productGroupTriggerQueueProcessor Complete, created bulkOp with ID:" +
      bulkOp.id,
  );
};

export const productGroupQueueProcessor = async (
  job: Job<ProductGroupJobData>,
): Promise<void> => {
  const handleComplete = async () => {
    await jobLog(job, "productGroupQueueProcessor Completed");
    console.log("productGroupQueueProcessor Completed");
  };

  await jobLog(job, "productGroupQueueProcessor Started");

  const bulkOpFromDatabase = await Container.bulkOperationService.findOneById(
    job.data.remoteBulkOperationId,
  );

  if (!bulkOpFromDatabase) {
    await jobLog(job, "BulkOp not found in database. Cannot process job");
    await handleComplete();
    return;
  }

  await jobLog(
    job,
    "bulkOpFromDatabase: " + JSON.stringify(bulkOpFromDatabase),
  );

  if (bulkOpFromDatabase.status.toLowerCase() !== "completed") {
    await jobLog(
      job,
      "Task has no data url (full sync requires at least 1 line of data) OR bulkOp status is not completed. Job will be marked as completed as Shopify job failed.",
    );
    await handleComplete();
    return;
  }

  const store = await Container.shopifyStoreService.findStoreByDomain(
    job.data.domain,
  );

  if (!store) {
    await jobLog(
      job,
      `Store not found for domain: ${job.data.domain}. Completing job without queuing next job`,
    );
    return;
  }

  const uuid = v4();
  await jobLog(job, `Getting data from url: ${bulkOpFromDatabase.dataUrl}`);

  if (bulkOpFromDatabase.dataUrl) {
    const writer = createWriteStream(`/tmp/${uuid}.jsonl`);
    await axios
      .get(bulkOpFromDatabase.dataUrl, { responseType: "stream" })
      .then((response) => {
        response.data.pipe(writer);
        return finished(writer);
      });

    await jobLog(job, `File written to /tmp/${uuid}.jsonl`);
  }

  let productGroupInputs: ProductGroupInput[] = [];
  let allProductGroupShopifyIdsFromThisFile: string[] = [];
  let productsInGroups: { [productGroupId: string]: string[] } = {};
  let productGroupIdsToExplicitlyEnsureDeleted: string[] = [];
  const productGroupIdToExplicitlyCheck = job.data.groupIds ?? [];
  if (productGroupIdToExplicitlyCheck.length > 0) {
    await jobLog(
      job,
      `Job will update the following product groups: ${JSON.stringify(
        productGroupIdToExplicitlyCheck,
      )}`,
    );
  } else {
    await jobLog(job, `Task will update all product groups`);
  }

  if (bulkOpFromDatabase.dataUrl) {
    await jobLog(job, "Parsing data");
    for await (const collectionObj of readJsonl(`/tmp/${uuid}.jsonl`)) {
      const collectionId = gidConverter(collectionObj.id, "ShopifyCollection")!;
      allProductGroupShopifyIdsFromThisFile.push(collectionId);

      if (!collectionObj.publishedOnCurrentPublication) {
        await jobLog(
          job,
          `Skipping collection ${collectionId} as it is not published on current publication`,
        );
        productGroupIdsToExplicitlyEnsureDeleted.push(collectionId);
        continue;
      }

      let image: string | undefined = undefined;

      if (collectionObj.image?.url) {
        image = collectionObj.image.url;
      }

      (collectionObj.Product ?? []).map((p: any) => {
        const productId = gidConverter(p.id, "ShopifyProduct")!;

        if (p.featuredImage?.url) {
          if (image === undefined || image === "") {
            image = p.featuredImage.url;
          }
        }

        if (productsInGroups[collectionId] === undefined) {
          productsInGroups[collectionId] = [productId];
        } else {
          productsInGroups[collectionId].push(productId);
        }
      });

      const productGroupInput: ProductGroupInput = {
        id: collectionId,
        displayName: collectionObj.title,
        // this should be metaimages?
        featuredImage: image
          ? {
              url: image,
              preferredImage: false,
            }
          : null,
        //We dont yet support metadata on collections
        metadata: [],
      };
      productGroupInputs.push(productGroupInput);
    }
  }

  await jobLog(
    job,
    "Upserting product groups on cloudshelf: " +
      JSON.stringify(productGroupInputs),
  );

  await Container.shopifyStoreService.updateProductGroups(
    job.data.domain,
    productGroupInputs,
  );

  console.log("Updating products in groups on cloudshelf");
  for (const [productGroupId, productIds] of Object.entries(productsInGroups)) {
    await Container.shopifyStoreService.updateProductsInProductGroup(
      job.data.domain,
      productGroupId,
      productIds,
    );
  }

  //Now, we need to handle creating the first cloudshelf if needed
  const installAlreadyCompleted =
    await Container.shopifyStoreService.isStoreFullyInstalled(job.data.domain);
  if (!installAlreadyCompleted) {
    const firstCloudshelf: CloudshelfInput = {
      id: `gid://external/ConnectorGeneratedCloudshelf/${job.data.domain}`,
      randomContent: true,
      displayName: "First Cloudshelf",
      homeFrameCallToAction: "Touch to discover and buy",
    };
    await Container.shopifyStoreService.upsertCloudshelf(
      job.data.domain,
      firstCloudshelf,
    );
  }

  //todo: delete delete groups that are not in the file
  if ((job.data.groupIds ?? []).length === 0) {
    //this was a full sync, so we can delete all ids we did not see
    //deleteAllExcept
  } else {
    //this was a partial sync, so we need to delete all ids that we did not see

    const productGroupsIdsWeShouldHaveSeen = job.data.groupIds;
    const productGroupIdsWeDidNotSee = productGroupsIdsWeShouldHaveSeen.filter(
      (p) => !allProductGroupShopifyIdsFromThisFile.includes(p),
    );

    // deleteByIds
  }

  await handleComplete();
};
