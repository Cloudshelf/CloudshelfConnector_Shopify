import { QueueNames } from "./queue.names.const";
import { Container } from "../../container";

export const registerQueues = async () => {
  console.debug("Registering queues...");
  await Container.queueService.registerQueue(QueueNames.TEST, async (data) => {
    console.log("QUEUE DATA", data);
  });

  await Container.queueService.registerQueue(
    QueueNames.POST_INSTALL_THEME,
    async (data) => {
      console.log("POST_INSTALL_THEME", data);
    },
  );
  console.debug("Queues registration complete");
};
