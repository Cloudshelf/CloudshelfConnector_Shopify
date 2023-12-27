import { Job, Queue } from "bullmq";
import { createProductGroupTriggerJob } from "../productgroup/productgroup.job.functions";
import { Container } from "../../../../container";
import { BulkOperationType } from "../../../bulkOperation/bulk-operation.type";
import { ProductJobData, ProductTriggerJobData } from "./product.job.data.type";
import { buildProductsQueryString } from "../../../../graphql/shopifyAdmin/bulk_operations.util";
import { jobLog } from "../../../../utils/jobLog";
import { createWriteStream, promises as fsPromises } from "fs";
import { v4 } from "uuid";
import axios from "axios";
import * as stream from "stream";
import { promisify } from "util";
import { readJsonlChunked } from "../../../../utils/readJsonlChunked";
import {
  KeyValuePair,
  KeyValuePairInput,
  MetadataInput,
  MetaimageInput,
  ProductInput,
  ProductVariantInput,
  UpsertVariantsInput,
} from "../../../../graphql/cloudshelf/generated/cloudshelf";
import { gidConverter } from "../../../../utils/gidConverter";
const finished = promisify(stream.finished);

export const productTriggerQueueProcessor = async (
  job: Job<ProductTriggerJobData>,
): Promise<void> => {
  await jobLog(job, "productTriggerQueueProcessor Started");

  const withPublicationStatus = true;

  const bulkOperationString = buildProductsQueryString(
    job.data.productIds,
    withPublicationStatus,
  );

  const bulkOp = await Container.bulkOperationService.createBulkOperation(
    job,
    job.data.domain,
    BulkOperationType.ProductSync,
    bulkOperationString,
    job.data.installStyleSync ?? false,
    job.data.productIds,
  );

  await jobLog(
    job,
    "productTriggerQueueProcessor Complete, created bulkOp with ID:" +
      bulkOp.id,
  );
};

export const productQueueProcessor = async (
  job: Job<ProductJobData>,
): Promise<void> => {
  const handleComplete = async () => {
    //We always need to queue a product group trigger job after we successfully complete a product job
    await createProductGroupTriggerJob(
      job.data.domain,
      [],
      job.data.installStyleSync,
    );

    await jobLog(job, "productQueueProcessor Completed");
    console.log("productQueueProcessor Completed");
  };

  await jobLog(job, "productQueueProcessor Started");

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

  if (
    !bulkOpFromDatabase.dataUrl ||
    bulkOpFromDatabase.status.toLowerCase() !== "completed"
  ) {
    await jobLog(
      job,
      "Task has no data url (full sync requires at least 1 line of data) OR bulkOp status is not completed. Job will be marked as completed as Shopify job failed. Status: " +
        bulkOpFromDatabase.status,
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

  await jobLog(job, `Getting data from url: ${bulkOpFromDatabase.dataUrl}`);

  const uuid = v4();
  const writer = createWriteStream(`/tmp/${uuid}.jsonl`);
  await axios
    .get(bulkOpFromDatabase.dataUrl, { responseType: "stream" })
    .then((response) => {
      response.data.pipe(writer);
      return finished(writer);
    });

  await jobLog(job, `File written to /tmp/${uuid}.jsonl`);

  const productIdToExplicitlyCheck = job.data.productIds ?? [];

  if (productIdToExplicitlyCheck.length > 0) {
    await jobLog(
      job,
      `Job will update the follow products: ${JSON.stringify(
        productIdToExplicitlyCheck,
      )}`,
    );
  } else {
    await jobLog(job, `Task will update all products`);
  }

  const chunkSize = 1000;
  await jobLog(job, `Reading file in chunks of ${chunkSize} products`);

  let productInputs: ProductInput[] = [];
  let allProductShopifyIdsFromThisFile: string[] = [];
  let productIdsToExplicitlyEnsureDeleted: string[] = [];
  let variantInputs: UpsertVariantsInput[] = [];

  for await (const productsInJsonLChunk of readJsonlChunked(
    `/tmp/${uuid}.jsonl`,
    chunkSize,
  )) {
    await jobLog(job, "--- Chunk started ---");
    const shopifyIdsForThisChunk = productsInJsonLChunk.map((p: any) => p.id);
    allProductShopifyIdsFromThisFile.push(...allProductShopifyIdsFromThisFile);
    await jobLog(job, "Ids in Chunk: " + shopifyIdsForThisChunk.join(","));

    //
    for (const productInJsonL of productsInJsonLChunk) {
      const product = productInJsonL as any;
      const productId = gidConverter(product.id, "ShopifyProduct")!;

      if (
        product.status.toLowerCase() !== "active" ||
        !product.publishedOnCurrentPublication
      ) {
        await jobLog(
          job,
          `Product is inactive or not published. Skipping. Prod: ${product.handle}, status: ${product.status}, publishedOnCurrentPublication: ${product.publishedOnCurrentPublication}`,
        );

        productIdsToExplicitlyEnsureDeleted.push(productId);
        continue;
      }

      //Map over shopify product metafields, and create cloudshelf metadata
      const metadata: MetadataInput[] = [];
      (product.Metafield ?? []).map((metafield: any) => {
        const metafieldInput: MetadataInput = {
          id: gidConverter(metafield.id, "ShopifyMetafield"),
          key: `${metafield.namespace}-${metafield.key}`,
          data: metafield.value,
        };

        metadata.push(metafieldInput);
      });

      //convert shopify product data to cloudshelf product data
      const productInput: ProductInput = {
        id: productId!,
        displayName: product.title,
        description: product.descriptionHtml,
        vendor: product.vendor,
        tags: product.tags,
        productType: product.productType,
        metadata: metadata,
      };
      productInputs.push(productInput);

      //convert shopify product variants to cloudshelf product variants
      (product.ProductVariant ?? []).map(
        (variant: any, variantIndex: number) => {
          const attributes: KeyValuePairInput[] = [];
          (variant.selectedOptions ?? []).map((opt: any) => {
            attributes.push({
              key: opt.name,
              value: opt.value,
            });
          });

          const metaimages: MetaimageInput[] = [];
          if (variant.image) {
            metaimages.push({
              url: variant.image.url,
              preferredImage: false,
            });
          }

          if (variantIndex === 0) {
            // We only support images on variants, while shopify supports them on product as well as the variant
            // we handle this by allowing an image to be marked as the preferred image, which means it will be the
            // image used for the product before a variant is selected
            if (product.featuredImage) {
              metaimages.push({
                url: product.featuredImage.url,
                preferredImage: true,
              });
            }

            (product.ProductImage ?? []).map((image: any) => {
              metaimages.push({
                url: image.url,
                preferredImage: false,
              });
            });
          }

          const ProductVariantInput: ProductVariantInput = {
            id: gidConverter(variant.id, "ShopifyProductVariant"),
            displayName: variant.title,
            currentPrice: parseFloat(variant.price),
            originalPrice: parseFloat(variant.compareAtPrice ?? variant.price),
            sku: variant.sku ?? "",
            //We only support in stock / out of stock not stock count in v3
            isInStock: variant.sellableOnlineQuantity > 0,
            attributes: attributes,
            availableToPurchase: variant.availableForSale,
            metaimages: metaimages,
            //We don't yet support variant metadata
            metadata: [],
          };

          const existingVariantInput = variantInputs.find(
            (v) => v.productId === productId,
          );
          if (existingVariantInput) {
            existingVariantInput.variants.push(ProductVariantInput);
          } else {
            variantInputs.push({
              productId: productId,
              variants: [ProductVariantInput],
            });
          }
        },
      );
    }

    console.log("Upserting products to cloudshelf for current chunk");

    //split into chunks of 250
    const chunkedProductInputs = productInputs.reduce(
      (resultArray: ProductInput[][], item, index) => {
        const chunkIndex = Math.floor(index / 250);

        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
      },
      [],
    );

    for (const chunk of chunkedProductInputs) {
      await Container.shopifyStoreService.upsertProductsToCloudshelf(
        job.data.domain,
        chunk,
      );
    }

    console.log("Upserting variants to cloudshelf for current chunk");

    const chunkedVariantInputs = variantInputs.reduce(
      (resultArray: UpsertVariantsInput[][], item, index) => {
        const chunkIndex = Math.floor(index / 50);

        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
      },
      [],
    );

    for (const variantInput of chunkedVariantInputs) {
      await Container.shopifyStoreService.upsertProductVariantsToCloudshelf(
        job.data.domain,
        variantInput,
      );
    }
    await jobLog(job, "--- Chunk finished ---");
  }

  //todo: delete products that are not in the file
  if ((job.data.productIds ?? []).length === 0) {
    //this was a full sync, so we can delete all ids we did not see
    //deleteAllExcept
  } else {
    //this was a partial sync, so we need to delete all ids that we did not see

    const productIdsWeShouldHaveSeen = job.data.productIds;
    const productIdsWeDidNotSee = productIdsWeShouldHaveSeen.filter(
      (p) => !allProductShopifyIdsFromThisFile.includes(p),
    );

    // deleteByIds
  }

  await jobLog(job, `Deleting file /tmp/${uuid}.jsonl`);
  await fsPromises.unlink(`/tmp/${uuid}.jsonl`);
  await handleComplete();
};
