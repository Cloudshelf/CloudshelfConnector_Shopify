import { Body, Controller, Post, UnauthorizedError } from "routing-controllers";
import { Container } from "../../container";

@Controller("/webhooks")
export class WebhookController {
  @Post("/deleteall")
  async deleteAll(@Body() { token }: { token: string }) {
    if (process.env.WEBHOOK_ADMIN_TOKEN === undefined) {
      throw new UnauthorizedError();
    }
    if (token === process.env.WEBHOOK_ADMIN_TOKEN) {
      await Container.initialise();
      const webhookService = Container.webhookService;
      const result = await webhookService.deleteAllWebhooksForAllStores();
      return "OK: " + JSON.stringify(result);
    }
    throw new UnauthorizedError();
  }

  @Post("/registerall")
  async registerAll(@Body() { token }: { token: string }) {
    if (process.env.WEBHOOK_ADMIN_TOKEN === undefined) {
      throw new UnauthorizedError();
    }
    if (token === process.env.WEBHOOK_ADMIN_TOKEN) {
      await Container.initialise();
      const webhookService = Container.webhookService;
      const result = await webhookService.registerAllWebhooksForAllStores();
      return "OK " + JSON.stringify(result);
    }
    throw new UnauthorizedError();
  }
}