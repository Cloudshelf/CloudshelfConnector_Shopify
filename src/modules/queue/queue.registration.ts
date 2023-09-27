import { container } from "tsyringe";
import { QueueService } from "./queue.service";
import { QueueNames } from "./queue.names.const";

export const registerQueues = async () => {
  console.debug("Registering queues...");
  const queueService = container.resolve(QueueService);
  await queueService.registerQueue(QueueNames.TEST, async (data) => {
    console.log("QUEUE DATA", data);
  });

  await queueService.registerQueue(
    QueueNames.POST_INSTALL_THEME,
    async (data) => {
      console.log("POST_INSTALL_THEME", data);
    },
  );
  console.debug("Queues registration complete");
};
