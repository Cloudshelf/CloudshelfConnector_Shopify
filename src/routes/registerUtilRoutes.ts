import { Express } from "express";
import { createThemeJob } from "../modules/queue/queues/theme/theme.job.functions";
import { Container } from "../container";
import { buildProductsQueryString } from "../graphql/shopifyAdmin/bulk_operations.util";
import { BulkOperationType } from "../modules/bulkOperation/bulk-operation.type";
import { createProductGroupTriggerJob } from "../modules/queue/queues/productgroup/productgroup.job.functions";
import { jobLog } from "../utils/jobLog";
import { v4 } from "uuid";
import { createWriteStream, promises as fsPromises } from "fs";
import axios from "axios";
import {
  KeyValuePairInput,
  MetadataInput,
  MetaimageInput,
  ProductInput,
  UpsertVariantsInput,
  ProductVariantInput,
} from "../graphql/cloudshelf/generated/cloudshelf";
import { readJsonlChunked } from "../utils/readJsonlChunked";
import { gidConverter } from "../utils/gidConverter";
import { promisify } from "util";
import stream from "stream";
const finished = promisify(stream.finished);
export function RegisterUtilRoutes(app: Express) {
  console.info("Registering util routes...");

  app.get("/crash", (req, res) => {
    throw new Error("Test crash");
  });

  app.get("/util/test1", async (req, res, next) => {
    await Container.queueService.checkSyncHealth();
  });

  app.get("/util/testBulk", async (req, res, next) => {
    // const withPublicationStatus = true;
    //
    // const bulkOperationString = buildProductsQueryString(
    //   [],
    //   withPublicationStatus,
    // );
    //
    // const bulkOp = await Container.bulkOperationService.createBulkOperation(
    //   "mamoth-25k.myshopify.com",
    //   BulkOperationType.ProductSync,
    //   bulkOperationString,
    //   false,
    //   [],
    //   undefined,
    // );
  });

  // app.get("/FORCE", async (req, res, next) => {
  //   // await createThemeJob("cs-connector-store.myshopify.com", true);
  //   await createThemeJob("csl-fashion-2021.myshopify.com", true);
  //   res.send("force done");
  // });

  app.get("/slack", async (req, res, next) => {
    await Container.slackService.test();
    res.send("done");
  });

  app.get("/dev-slack", async (req, res, next) => {
    await Container.slackService.test(true);
    res.send("done");
  });

  app.get("/app/delsess", async (req, res, next) => {
    /* DEBUG */
    await Container.shopifyService.deleteAllSessions(
      "cs-connector-store.myshopify.com",
    );
    res.send("done");
  });

  app.get("/app/getsess", async (req, res, next) => {
    /* DEBUG */
    await Container.shopifyService.printAllSessions(
      "cs-connector-store.myshopify.com",
    );
    res.send("done");
  });

  app.get("/app/test", async (req, res, next) => {
    /* DEBUG */
    const orm = Container.orm;
    console.log(orm);
    //A quick test area to test out code

    res.send("done test");
  });
}
