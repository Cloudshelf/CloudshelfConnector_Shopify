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
} from "../../../../graphql/cloudshelf/generated/cloudshelf";
import { gidConverter } from "../../../../utils/gidConverter";
const finished = promisify(stream.finished);

export const productTriggerQueueProcessor = async (
  job: Job<ProductTriggerJobData>,
): Promise<void> => {
  await job.log("productTriggerQueueProcessor Started");
  console.log("productTriggerQueueProcessor Started");

  const withPublicationStatus = true;

  const bulkOperationString = buildProductsQueryString(
    job.data.productIds,
    withPublicationStatus,
  );

  const bulkOp = await Container.bulkOperationService.createBulkOperation(
    job.data.domain,
    BulkOperationType.ProductSync,
    bulkOperationString,
    job.data.productIds,
  );

  await job.log(
    "productTriggerQueueProcessor Complete, created bulkOp with ID:" +
      bulkOp.id,
  );
  console.log(
    "productTriggerQueueProcessor Complete, created bulkOp with ID:" +
      bulkOp.id,
  );
};

export const productQueueProcessor = async (
  job: Job<ProductJobData>,
): Promise<void> => {
  const handleComplete = async () => {
    //We always need to queue a product group trigger job after we successfully complete a product job
    await createProductGroupTriggerJob(job.data.domain);

    await jobLog(job, "productQueueProcessor Completed");
    console.log("productQueueProcessor Completed");
  };

  await jobLog(job, "productQueueProcessor Started");

  let bulkOpIdFromJob = job.data.remoteBulkOperationId;
  bulkOpIdFromJob = "b627c14b-3c5f-42e5-944a-bd6301d9510f";

  const bulkOpFromDatabase = await Container.bulkOperationService.findOneById(
    bulkOpIdFromJob,
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
  let variantInputs: { [productId: string]: ProductVariantInput[] } = {};

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

          if (variantInputs[productId] === undefined) {
            variantInputs[productId] = [ProductVariantInput];
          } else {
            variantInputs[productId].push(ProductVariantInput);
          }
        },
      );
    }

    console.log("Upserting products to cloudshelf for current chunk");
    await Container.shopifyStoreService.upsertProductsToCloudshelf(
      job.data.domain,
      productInputs,
    );

    console.log("Upserting variants to cloudshelf for current chunk");
    for (const [productId, variants] of Object.entries(variantInputs)) {
      await Container.shopifyStoreService.upsertProductVariantsToCloudshelf(
        job.data.domain,
        variants,
        productId,
      );
    }

    await jobLog(job, "--- Chunk finished ---");
  }

  await jobLog(job, `Deleting file /tmp/${uuid}.jsonl`);
  await fsPromises.unlink(`/tmp/${uuid}.jsonl`);
  await handleComplete();
};
