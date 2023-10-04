import { DatabaseService } from "./modules/database/Database";
import { ShopifyService } from "./modules/shopify/shopify.service";
import { PostgreSqlMikroORM } from "@mikro-orm/postgresql/PostgreSqlMikroORM";
import { ShopifyStoreService } from "./modules/shopifyStore/shopify-store.service";
import { AuthService } from "./modules/auth/auth.service";
import { QueueService } from "./modules/queue/queue.service";
import { BulkOperationService } from "./modules/bulkOperation/bulk-opertation.service";
import { BulkOperationController } from "./modules/bulkOperation/bulk-operation.controller";

export class Container {
  private static _initialised = false;
  private static _databaseService: DatabaseService;
  private static _shopifyService: ShopifyService;
  private static _shopifyStoreService: ShopifyStoreService;
  private static _authService: AuthService;
  private static _queueService: QueueService;
  private static _bulkOperationService: BulkOperationService;

  static async initialise() {
    console.debug("Initialising container...");
    this._databaseService = new DatabaseService();
    await this._databaseService.initialise();
    this._shopifyService = new ShopifyService();
    this._shopifyStoreService = new ShopifyStoreService();
    this._authService = new AuthService();
    this._queueService = new QueueService();
    this._bulkOperationService = new BulkOperationService();

    this._initialised = true;
    console.debug("Container initialised");
  }

  static get isInitialised() {
    return this._initialised;
  }

  private static throwIfNotInitialised() {
    if (!this._initialised) {
      throw new Error("Container not initialised");
    }
  }

  static get orm(): PostgreSqlMikroORM {
    this.throwIfNotInitialised();

    return this._databaseService.getOrm();
  }

  static get entityManager() {
    this.throwIfNotInitialised();

    return this.orm.em.fork();
  }

  static get authService(): AuthService {
    this.throwIfNotInitialised();

    return this._authService;
  }

  static get shopifyService(): ShopifyService {
    this.throwIfNotInitialised();

    return this._shopifyService;
  }

  static get shopifyStoreService(): ShopifyStoreService {
    this.throwIfNotInitialised();

    return this._shopifyStoreService;
  }

  static get queueService(): QueueService {
    this.throwIfNotInitialised();

    return this._queueService;
  }

  static get bulkOperationService(): BulkOperationService {
    this.throwIfNotInitialised();

    return this._bulkOperationService;
  }
}
