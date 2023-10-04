import { Container } from "../../../../container";
import { QueueNames } from "../../queue.names.const";
import {
  ProductGroupJobData,
  ProductGroupTriggerJobData,
} from "./productgroup.job.data.type";

export const createProductGroupTriggerJob = async (
  domain: string,
  firstSync = false,
  groupIds: string[] = [],
): Promise<void> => {
  const jobPayload: ProductGroupTriggerJobData = {
    domain,
    lockId: domain,
    isFirstSync: firstSync,
    groupIds,
  };

  const existingJob =
    await Container.queueService.findJobForDomain<ProductGroupTriggerJobData>(
      QueueNames.PRODUCT_GROUP_TRIGGER,
      domain,
    );

  if (firstSync || groupIds.length === 0) {
    //We want to do a full sync here, remove any existing jobs
    if (existingJob) {
      await existingJob.remove();
    }

    await Container.queueService.addJob(
      QueueNames.PRODUCT_GROUP_TRIGGER,
      jobPayload,
      { delay: 1000 },
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
        { delay: 1000 },
      );
    }
  }
};

export const createProductGroupJob = async (
  domain: string,
  bulkOperationId: string,
  groupIds: string[],
): Promise<void> => {
  //Need to handle how we store this data, we used to do this in a table called bulk ops...
  const jobPayload: ProductGroupJobData = {
    domain,
    lockId: domain,
    isFirstSync: false,
    remoteBulkOperationId: bulkOperationId,
    groupIds: groupIds,
  };

  await Container.queueService.addJob(
    QueueNames.PRODUCT_GROUP_PROCESSOR,
    jobPayload,
    { delay: 1000 },
  );
};
