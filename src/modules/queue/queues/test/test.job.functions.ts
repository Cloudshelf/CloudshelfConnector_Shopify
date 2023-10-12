import { Container } from "../../../../container";
import { QueueNames } from "../../queue.names.const";
import { TestJobData } from "./test.job.data.type";

export const createTestJob = async (domain: string): Promise<void> => {
  const jobPayload: TestJobData = {
    domain,
    lockId: domain,
  };

  await Container.queueService.addJob(QueueNames.TEST, jobPayload);
};
