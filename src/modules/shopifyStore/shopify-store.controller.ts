import { Controller, Get } from "routing-controllers";
import { Lifecycle, scoped } from "tsyringe";

@Controller("/shopify-store")
export class ShopifyStoreController {
  constructor() {}

  @Get("/test")
  async test() {
    return "Hello world test.";
  }
}
