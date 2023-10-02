import { Job } from "bullmq";

export const locationQueueProcessor = async (job: Job): Promise<void> => {
  await job.log("Job completed");
};
