import { Job } from "bullmq";
import { createProductGroupJob } from "./productgroup.job.functions";

export const productGroupTriggerQueueProcessor = async (
  job: Job,
): Promise<void> => {
  await job.log("Product Group Trigger completed. Step 3");
  console.log("Product Group Trigger completed. Step 3");

  // await createProductGroupJob(job.data.domain);
};

export const productGroupQueueProcessor = async (job: Job): Promise<void> => {
  await job.log("Product Group completed. Step 4");
  console.log("Product Group completed. Step 4");
};
