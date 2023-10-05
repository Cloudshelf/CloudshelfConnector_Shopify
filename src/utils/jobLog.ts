import { Job } from "bullmq";

export const jobLog = async (job: Job, message: string) => {
  await job.log(message);
  console.log(message);
};
