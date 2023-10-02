import { Job } from "bullmq";

export const productQueueProcessor = async (job: Job): Promise<void> => {
  await job.log("Job completed");
};
