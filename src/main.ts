import "reflect-metadata";
import * as dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { useExpressServer } from "routing-controllers";
import { ShopifyStoreController } from "./modules/shopifyStore/shopify-store.controller";
import { DebugController } from "./modules/debug/debug.controller";
import { registerQueues } from "./modules/queue/queue.registration";
import { Container } from "./container";
import { BulkOperationController } from "./modules/bulkOperation/bulk-operation.controller";
import bodyParser from "body-parser";
import { QueueController } from "./modules/queue/queue.controller";
import { MetricsController } from "./modules/metrics/metrics.controller";
import { WebhookController } from "./modules/webhook/webhook.controller";
import * as Sentry from "@sentry/node";
import { RegisterUtilRoutes } from "./routes/registerUtilRoutes";
import { RegisterShopifyRoutes } from "./routes/registerShopifyRoutes";

dotenv.config();

(async () => {
  console.log("Starting up....");

  Error.stackTraceLimit = 100;
  const app = express();

  Sentry.init({
    dsn: process.env.SENTRY_DNS,
    tracesSampleRate: 1.0,
    environment: process.env.RELEASE_TYPE ?? "local",
    release: process.env.PACKAGE_VERSION ?? "development_local",
    ignoreErrors: [],
    ignoreTransactions: ["/_next/", "/img/", /^\/$/, /^\/\*$/],
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({
        // to trace all requests to the default router
        app,
      }),
    ],
  });

  Sentry.startTransaction({
    op: "Startup",
    name: "Application Startup",
  }).finish();

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  const port = process.env.PORT || 3123;
  await Container.initialise();
  if (!Container.isInitialised) {
    throw new Error("Container was not configured");
  }
  await registerQueues();

  RegisterUtilRoutes(app);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  useExpressServer(app, {
    controllers: [
      ShopifyStoreController,
      DebugController,
      BulkOperationController,
      QueueController,
      MetricsController,
      WebhookController,
    ],
    routePrefix: "/app",
  });

  RegisterShopifyRoutes(app);

  app.use(Sentry.Handlers.errorHandler());

  // In the event of an unexpected error, return a 500
  app.use(function (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.status(500);
    res.send("Internal server error");
  });

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();

// Handle unhandled promise rejections and uncaught exceptions to prevent crashes
process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection: ", err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception: ", err);
});

//
