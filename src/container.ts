import { DatabaseService } from "./modules/database/Database";
import { ShopifyService } from "./modules/shopify/shopify.service";
import { PostgreSqlMikroORM } from "@mikro-orm/postgresql/PostgreSqlMikroORM";
import { ShopifyStoreService } from "./modules/shopifyStore/shopify-store.service";
import { AuthService } from "./modules/auth/auth.service";
import { QueueService } from "./modules/queue/queue.service";
import { BulkOperationService } from "./modules/bulkOperation/bulk-opertation.service";
import { BulkOperationController } from "./modules/bulkOperation/bulk-operation.controller";
import { SlackService } from "./modules/slack/slack.service";
import { WebhookService } from "./modules/webhook/webhook.service";

export class Container {
  // private static _initialised = false;
  // private static _databaseService: DatabaseService;
  // private static _shopifyService: ShopifyService;
  // private static _shopifyStoreService: ShopifyStoreService;
  // private static _authService: AuthService;
  // private static _queueService: QueueService;
  // private static _bulkOperationService: BulkOperationService;
  // private static _slackService: SlackService;
  // private static _webhookService: WebhookService;
  // static customTokens: { [domain: string]: string } = {};

  static async initialise() {
    console.debug("Initialising container...");
    (global as any).customTokens = {};
    (global as any)._databaseService = new DatabaseService();
    await (global as any)._databaseService.initialise();
    (global as any)._shopifyService = new ShopifyService();
    (global as any)._shopifyStoreService = new ShopifyStoreService();
    (global as any)._authService = new AuthService();
    (global as any)._queueService = new QueueService();
    (global as any)._bulkOperationService = new BulkOperationService();
    (global as any)._slackService = new SlackService();
    (global as any)._webhookService = new WebhookService();

    (global as any)._initialised = true;
    console.debug("Container initialised");
  }

  static get isInitialised() {
    return (global as any)._initialised;
  }

  static get customTokens(): { [domain: string]: string } {
    return (global as any).customTokens;
  }

  private static throwIfNotInitialised() {
    if (!(global as any)._initialised) {
      throw new Error("Container not initialised");
    }
  }

  static get orm(): PostgreSqlMikroORM {
    this.throwIfNotInitialised();

    return (global as any)._databaseService.getOrm();
  }

  static get entityManager() {
    this.throwIfNotInitialised();

    return this.orm.em.fork();
  }

  static get authService(): AuthService {
    this.throwIfNotInitialised();

    return (global as any)._authService;
  }

  static get shopifyService(): ShopifyService {
    this.throwIfNotInitialised();

    return (global as any)._shopifyService;
  }

  static get shopifyStoreService(): ShopifyStoreService {
    this.throwIfNotInitialised();

    return (global as any)._shopifyStoreService;
  }

  static get queueService(): QueueService {
    this.throwIfNotInitialised();

    return (global as any)._queueService;
  }

  static get bulkOperationService(): BulkOperationService {
    this.throwIfNotInitialised();

    return (global as any)._bulkOperationService;
  }

  static get slackService(): SlackService {
    this.throwIfNotInitialised();

    return (global as any)._slackService;
  }

  static get webhookService(): WebhookService {
    this.throwIfNotInitialised();

    return (global as any)._webhookService;
  }
}
