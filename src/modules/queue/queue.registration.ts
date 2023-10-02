import { QueueNames } from "./queue.names.const";
import { Container } from "../../container";
import { testQueueProcessor } from "./queues/test/test.queue.processor";
import { themeQueueProcessor } from "./queues/theme/theme.queue.processor";
import { locationQueueProcessor } from "./queues/location/location.queue.processor";
import { productQueueProcessor } from "./queues/product/product.queue.processor";
import { productGroupQueueProcessor } from "./queues/productgroup/productgroup.queue.processor";
import { createThemeJob } from "./queues/theme/theme.job.functions";

export const registerQueues = async () => {
  console.debug("Registering queues...");

  await Container.queueService.registerQueue(
    QueueNames.TEST,
    testQueueProcessor,
  );

  await Container.queueService.registerQueue(
    QueueNames.THEME,
    themeQueueProcessor,
  );

  await Container.queueService.registerQueue(
    QueueNames.LOCATION,
    locationQueueProcessor,
  );

  await Container.queueService.registerQueue(
    QueueNames.PRODUCT,
    productQueueProcessor,
  );

  await Container.queueService.registerQueue(
    QueueNames.PRODUCT_GROUP,
    productGroupQueueProcessor,
  );

  console.debug("Queues registration complete");
};
