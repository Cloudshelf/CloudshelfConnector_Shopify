import { Job } from "bullmq";

export const testQueueProcessor = async (job: Job): Promise<void> => {
  await job.log("Job started");
  console.log("[TEST QUEUE PROCESSOR] Job id: ", job.id);
  console.log("[TEST QUEUE PROCESSOR] Job name: ", job.name);
  console.log("[TEST QUEUE PROCESSOR] Job data: ", job.data);
  await job.log("Job completed");
};
