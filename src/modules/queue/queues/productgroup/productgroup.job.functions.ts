import { Container } from "../../../../container";
import { QueueNames } from "../../queue.names.const";
import {
  ProductGroupJobData,
  ProductGroupTriggerJobData,
} from "./productgroup.job.data.type";

export const createProductGroupTriggerJob = async (
  domain: string,
  groupIds: string[] = [],
  installStyleSync = false,
  webhookDelay = false,
): Promise<void> => {
  let delay = 1000; // 1 second delay by default

  if (webhookDelay) {
    //set the delay to be 15 minutes
    delay = 60 * 15 * 1000;
  }

  const jobPayload: ProductGroupTriggerJobData = {
    domain,
    lockId: domain,
    groupIds,
    installStyleSync,
  };

  const existingJob =
    await Container.queueService.findJobForDomain<ProductGroupTriggerJobData>(
      QueueNames.PRODUCT_GROUP_TRIGGER,
      domain,
    );

  if (groupIds.length === 0) {
    //We want to do a full sync here, remove any existing jobs
    if (existingJob) {
      await existingJob.remove();
    }

    await Container.queueService.addJob(
      QueueNames.PRODUCT_GROUP_TRIGGER,
      jobPayload,
      { delay },
    );
  } else {
    if (existingJob) {
      const existingGroupIds = existingJob?.data?.groupIds ?? [];

      await existingJob.updateData({
        ...existingJob.data,
        groupIds: [...existingGroupIds, ...groupIds],
      });
    } else {
      await Container.queueService.addJob(
        QueueNames.PRODUCT_GROUP_TRIGGER,
        jobPayload,
        { delay },
      );
    }
  }
};

export const createProductGroupJob = async (
  domain: string,
  bulkOperationId: string,
  groupIds: string[],
  installStyleSync = false,
): Promise<void> => {
  //Need to handle how we store this data, we used to do this in a table called bulk ops...
  const jobPayload: ProductGroupJobData = {
    domain,
    lockId: domain,
    remoteBulkOperationId: bulkOperationId,
    groupIds: groupIds,
    installStyleSync,
  };

  await Container.queueService.addJob(
    QueueNames.PRODUCT_GROUP_PROCESSOR,
    jobPayload,
    { delay: 1000 },
  );
};
