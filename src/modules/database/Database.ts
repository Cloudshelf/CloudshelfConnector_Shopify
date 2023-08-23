import { injectable, singleton } from "tsyringe";
import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { ReflectMetadataProvider } from "@mikro-orm/core";
import { PostgreSqlMikroORM } from "@mikro-orm/postgresql/PostgreSqlMikroORM";
import config from "../../mikro-orm.config";

@injectable()
export class DatabaseService {
  private initialised = false;
  private orm?: PostgreSqlMikroORM;

  constructor() {}
  async initialise() {
    if (this.initialised) {
      return;
    }

    this.orm = await MikroORM.init<PostgreSqlDriver>({
      ...config,
      metadataProvider: ReflectMetadataProvider,
    });
    await this.orm.connect();

    this.initialised = true;
    console.log("🗄️Database initialised");
  }

  getOrm() {
    if (!this.initialised) {
      throw new Error("Database not initialised");
    }
    return this.orm!;
  }

  async close() {
    if (!this.initialised) {
      return;
    }
    await this.orm!.close();
  }
}
