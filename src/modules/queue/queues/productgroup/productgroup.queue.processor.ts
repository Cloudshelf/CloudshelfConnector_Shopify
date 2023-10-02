import { Job } from "bullmq";

export const productGroupQueueProcessor = async (job: Job): Promise<void> => {
  await job.log("Job completed");
};
