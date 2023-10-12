import { Options } from "@mikro-orm/core";
import * as dotenv from "dotenv";
import { PostgreSqlOptions } from "@mikro-orm/postgresql/PostgreSqlMikroORM";

dotenv.config();

export default <PostgreSqlOptions>{
  entities: ["./dist/modules/**/*.entity.js"],
  entitiesTs: ["./src/modules/**/*.entity.ts"],
  dbName: process.env.DB_NAME ?? "",
  password: process.env.DB_PASSWORD ?? "",
  port: parseInt(process.env.DB_PORT ?? "0"),
  user: process.env.DB_USER ?? "",
  host: process.env.DB_HOST ?? "",
  type: "postgresql",
  driverOptions: {
    connection: {
      ssl: process.env.DATABASE_SSL === "true",
    },
  },
  migrations: {
    path: "./dist/migrations",
    pathTs: "./src/migrations",
  },
};
