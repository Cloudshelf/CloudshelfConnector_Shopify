import "reflect-metadata";
import * as dotenv from "dotenv";
import express from "express";
import validate from "./utils/request-validator";
import { container } from "tsyringe";
import { DatabaseService } from "./modules/database/Database";
import { RequestContext } from "@mikro-orm/core";

dotenv.config();

(async () => {
  const app = express();
  const port = process.env.PORT || 3123;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const databaseService = container.resolve(DatabaseService);
  await databaseService.initialise();

  app.use((req, res, next) => {
    RequestContext.create(container.resolve(DatabaseService).getOrm().em, next);
  });

  app.post("/", validate({}), (req, res) => {
    res.send("Hello world.");
  });

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
