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
import { createThemeJob } from "./queues/theme/theme.job.functions";
import {
  createProductJob,
  createProductTriggerJob,
} from "./queues/product/product.job.functions";
import { createLocationJob } from "./queues/location/location.job.functions";
import {
  createProductGroupJob,
  createProductGroupTriggerJob,
} from "./queues/productgroup/productgroup.job.functions";

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
    QueueNames.PRODUCT_TRIGGER,
    productTriggerQueueProcessor,
  );

  await Container.queueService.registerQueue(
    QueueNames.PRODUCT_PROCESSOR,
    productQueueProcessor,
  );

  await Container.queueService.registerQueue(
    QueueNames.PRODUCT_GROUP_TRIGGER,
    productGroupTriggerQueueProcessor,
  );

  await Container.queueService.registerQueue(
    QueueNames.PRODUCT_GROUP_PROCESSOR,
    productGroupQueueProcessor,
  );

  console.debug("Queues registration complete");

  // await createProductJob("cs-connector-store.myshopify.com", "", []);
  // await createLocationJob("cs-connector-store.myshopify.com");
  // await createProductTriggerJob("cs-connector-store.myshopify.com");
  await createProductGroupJob(
    "cs-connector-store.myshopify.com",
    "c09c07e9-9f0c-4cab-a270-e9cdc847c962",
    [],
  );
};
