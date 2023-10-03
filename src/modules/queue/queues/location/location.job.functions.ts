import { Container } from "../../../../container";
import { QueueNames } from "../../queue.names.const";
import { LocationJobData } from "./location.job.data.type";

export const createLocationJob = async (domain: string): Promise<void> => {
  const jobPayload: LocationJobData = {
    domain,
    lockId: domain,
  };

  await Container.queueService.addJob(QueueNames.LOCATION, jobPayload, {
    delay: 5000, //wait 5 seconds before processing
  });
};
