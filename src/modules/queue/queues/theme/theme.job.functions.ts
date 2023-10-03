import { Container } from "../../../../container";
import { ThemeJobData } from "./theme.job.data.type";
import { QueueNames } from "../../queue.names.const";

export const createThemeJob = async (domain: string): Promise<void> => {
  const jobPayload: ThemeJobData = {
    domain,
    lockId: domain,
  };

  await Container.queueService.addJob(QueueNames.THEME, jobPayload, {
    delay: 5000, //wait 5 seconds before processing
  });
};
