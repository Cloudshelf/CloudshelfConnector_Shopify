import { Container } from "../../../../container";
import { QueueNames } from "../../queue.names.const";
import { ProductJobData } from "./product.job.data.type";

export const createProductJob = async (domain: string): Promise<void> => {
  const jobPayload: ProductJobData = {
    domain,
    lockId: domain,
  };

  await Container.queueService.addJob(QueueNames.PRODUCT, jobPayload);
};
