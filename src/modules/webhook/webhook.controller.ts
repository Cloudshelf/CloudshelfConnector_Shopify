import { Body, Controller, Post, UnauthorizedError } from "routing-controllers";
import { Container } from "../../container";

@Controller("/webhooks")
export class WebhookController {
  @Post("/deleteall")
  async deleteAll(
    @Body()
    { token, limit, from }: { token: string; limit: number; from: number },
  ) {
    if (process.env.WEBHOOK_ADMIN_TOKEN === undefined) {
      throw new UnauthorizedError();
    }
    if (token === process.env.WEBHOOK_ADMIN_TOKEN) {
      await Container.initialise();
      const webhookService = Container.webhookService;
      const result = await webhookService.deleteAllWebhooksForAllStores(
        from,
        limit,
      );
      return "OK: " + JSON.stringify(result);
    }
    throw new UnauthorizedError();
  }

  @Post("/registerall")
  async registerAll(
    @Body()
    { token, limit, from }: { token: string; limit: number; from: number },
  ) {
    if (process.env.WEBHOOK_ADMIN_TOKEN === undefined) {
      throw new UnauthorizedError();
    }
    if (token === process.env.WEBHOOK_ADMIN_TOKEN) {
      await Container.initialise();
      const webhookService = Container.webhookService;
      const result = await webhookService.registerAllWebhooksForAllStores(
        from,
        limit,
      );
      return "OK " + JSON.stringify(result);
    }
    throw new UnauthorizedError();
  }
}
