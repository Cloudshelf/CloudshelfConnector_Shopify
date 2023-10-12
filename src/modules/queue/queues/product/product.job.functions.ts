import { Container } from "../../../../container";
import { QueueNames } from "../../queue.names.const";
import { ProductJobData, ProductTriggerJobData } from "./product.job.data.type";

export const createProductTriggerJob = async (
  domain: string,
  productIds: string[] = [],
  installStyleSync = false,
  webhookDelay = false,
): Promise<void> => {
  let delay = 1000; // 1 second delay by default

  if (webhookDelay) {
    //set the delay to be 15 minutes
    delay = 60 * 15 * 1000;
  }

  const jobPayload: ProductTriggerJobData = {
    domain,
    lockId: domain,
    productIds,
    installStyleSync,
  };

  const existingJob =
    await Container.queueService.findJobForDomain<ProductTriggerJobData>(
      QueueNames.PRODUCT_TRIGGER,
      domain,
    );

  if (productIds.length === 0) {
    //We want to do a full sync here, remove any existing jobs
    if (existingJob) {
      await existingJob.remove();
    }

    await Container.queueService.addJob(
      QueueNames.PRODUCT_TRIGGER,
      jobPayload,
      { delay },
    );
  } else {
    if (existingJob) {
      const existingProductIds = existingJob?.data?.productIds ?? [];

      await existingJob.updateData({
        ...existingJob.data,
        productIds: [...existingProductIds, ...productIds],
      });
    } else {
      console.log("adding job");
      await Container.queueService.addJob(
        QueueNames.PRODUCT_TRIGGER,
        jobPayload,
        { delay },
      );
    }
  }
};

export const createProductJob = async (
  domain: string,
  bulkOperationId: string,
  productIds: string[],
  installStyleSync = false,
): Promise<void> => {
  //Need to handle how we store this data, we used to do this in a table called bulk ops...
  const jobPayload: ProductJobData = {
    domain,
    lockId: domain,
    remoteBulkOperationId: bulkOperationId,
    productIds: productIds,
    installStyleSync,
  };

  await Container.queueService.addJob(
    QueueNames.PRODUCT_PROCESSOR,
    jobPayload,
    { delay: 1000 },
  );
};
