import { Job } from "bullmq";
import { createProductJob } from "./product.job.functions";
import { createProductGroupTriggerJob } from "../productgroup/productgroup.job.functions";

export const productTriggerQueueProcessor = async (job: Job): Promise<void> => {
  await job.log("Product Trigger completed. Step 1");
  console.log("Product Trigger completed. Step 1");

  await createProductJob(job.data.domain);
};

export const productQueueProcessor = async (job: Job): Promise<void> => {
  await job.log("Product completed. Step 2");
  console.log("Product completed. Step 2");

  await createProductGroupTriggerJob(job.data.domain);
};
