export const enum QueueNames {
  TEST = "TEST",
  THEME = "THEME",
  LOCATION = "LOCATION",
  //The following queues use bulk operations, and therefore need triggers and processors
  PRODUCT_TRIGGER = "PRODUCT_TRIGGER",
  PRODUCT_GROUP_TRIGGER = "PRODUCT_GROUP_TRIGGER",
  PRODUCT_PROCESSOR = "PRODUCT_PROCESSOR",
  PRODUCT_GROUP_PROCESSOR = "PRODUCT_GROUP_PROCESSOR",
}
