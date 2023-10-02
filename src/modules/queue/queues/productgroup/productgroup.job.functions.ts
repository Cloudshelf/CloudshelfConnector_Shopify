import { Container } from "../../../../container";
import { QueueNames } from "../../queue.names.const";
import { ProductGroupJobData } from "./productgroup.job.data.type";

export const createProductGroupJob = async (domain: string): Promise<void> => {
  const jobPayload: ProductGroupJobData = {
    domain,
    lockId: domain,
  };

  await Container.queueService.addJob(QueueNames.PRODUCT_GROUP, jobPayload);
};
