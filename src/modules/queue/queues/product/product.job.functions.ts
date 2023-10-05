import { Container } from "../../../../container";
import { QueueNames } from "../../queue.names.const";
import { ProductJobData, ProductTriggerJobData } from "./product.job.data.type";

export const createProductTriggerJob = async (
  domain: string,
  firstSync = false,
  productIds: string[] = [],
): Promise<void> => {
  const jobPayload: ProductTriggerJobData = {
    domain,
    lockId: domain,
    isFirstSync: firstSync,
    productIds,
  };

  const existingJob =
    await Container.queueService.findJobForDomain<ProductTriggerJobData>(
      QueueNames.PRODUCT_TRIGGER,
      domain,
    );

  if (firstSync || productIds.length === 0) {
    //We want to do a full sync here, remove any existing jobs
    if (existingJob) {
      await existingJob.remove();
    }

    await Container.queueService.addJob(
      QueueNames.PRODUCT_TRIGGER,
      jobPayload,
      { delay: 1000 },
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
        { delay: 1000 },
      );
    }
  }
};

export const createProductJob = async (
  domain: string,
  bulkOperationId: string,
  productIds: string[],
  isfirstSync = false,
): Promise<void> => {
  //Need to handle how we store this data, we used to do this in a table called bulk ops...
  const jobPayload: ProductJobData = {
    domain,
    lockId: domain,
    isFirstSync: isfirstSync,
    remoteBulkOperationId: bulkOperationId,
    productIds: productIds,
  };

  await Container.queueService.addJob(
    QueueNames.PRODUCT_PROCESSOR,
    jobPayload,
    { delay: 1000 },
  );
};
