import { Job } from "bullmq";
import { createProductJob } from "./product.job.functions";
import { createProductGroupTriggerJob } from "../productgroup/productgroup.job.functions";
import { Container } from "../../../../container";
import { BulkOperationType } from "../../../bulkOperation/bulk-operation.type";
import { ProductJobData, ProductTriggerJobData } from "./product.job.data.type";
import { buildProductsQueryString } from "../../../../graphql/shopifyAdmin/bulk_operations.util";

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
  await job.log("Product completed. Step 2");
  console.log("Product completed. Step 2");

  await createProductGroupTriggerJob(job.data.domain);
};
