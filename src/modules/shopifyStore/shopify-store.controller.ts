import { Controller, Get } from "routing-controllers";

@Controller("/shopify-store")
export class ShopifyStoreController {
  constructor() {}

  @Get("/test")
  async test() {
    return "Hello world test.";
  }
}
