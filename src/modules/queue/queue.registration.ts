import { QueueNames } from "./queue.names.const";
import { Container } from "../../container";
import { testQueueProcessor } from "./queues/test/test.queue.processor";
import { themeQueueProcessor } from "./queues/theme/theme.queue.processor";
import { locationQueueProcessor } from "./queues/location/location.queue.processor";
import {
  productQueueProcessor,
  productTriggerQueueProcessor,
} from "./queues/product/product.queue.processor";
import {
  productGroupQueueProcessor,
  productGroupTriggerQueueProcessor,
} from "./queues/productgroup/productgroup.queue.processor";

export const registerQueues = async () => {
  console.debug("Registering queues...");

  await Container.queueService.registerQueue(
    QueueNames.TEST,
    testQueueProcessor,
    2,
  );

  await Container.queueService.registerQueue(
    QueueNames.THEME,
    themeQueueProcessor,
    2,
  );

  await Container.queueService.registerQueue(
    QueueNames.LOCATION,
    locationQueueProcessor,
    2,
  );

  await Container.queueService.registerQueue(
    QueueNames.PRODUCT_TRIGGER,
    productTriggerQueueProcessor,
    3,
  );

  await Container.queueService.registerQueue(
    QueueNames.PRODUCT_PROCESSOR,
    productQueueProcessor,
    2,
  );

  await Container.queueService.registerQueue(
    QueueNames.PRODUCT_GROUP_TRIGGER,
    productGroupTriggerQueueProcessor,
    3,
  );

  await Container.queueService.registerQueue(
    QueueNames.PRODUCT_GROUP_PROCESSOR,
    productGroupQueueProcessor,
    2,
  );

  console.debug("Queues registration complete");
};
