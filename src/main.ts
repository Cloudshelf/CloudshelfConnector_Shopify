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

  // RequestHandler creates a separate execution context, so that all
  // transactions/spans/breadcrumbs are isolated across requests
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

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

  const port = process.env.PORT || 3123;
  await Container.initialise();
  if (!Container.isInitialised) {
    throw new Error("Container was not configured");
  }
  await registerQueues();

  RegisterShopifyRoutes(app);

  // app.get("/app/delsess", async (req, res, next) => {
  //   /* DEBUG */
  //   await Container.shopifyService.deleteAllSessions(
  //     "cs-connector-store.myshopify.com",
  //   );
  //   res.send("done");
  // });
  //
  // app.get("/app/getsess", async (req, res, next) => {
  //   /* DEBUG */
  //   await Container.shopifyService.printAllSessions(
  //     "cs-connector-store.myshopify.com",
  //   );
  //   res.send("done");
  // });
  //
  // app.get("/app/test", async (req, res, next) => {
  //   /* DEBUG */
  //   const orm = Container.orm;
  //   console.log(orm);
  //   //A quick test area to test out code
  //
  //   res.send("done test");
  // });

  // ///////
  // // We proxy all requests except those prefixed with /app to the Cloudshelf Manager, so that the app can be embedded in
  // // Shopify's Admin panel transparently. Most eCommerce connectors will not need to do this as apps will be hosted
  // // separately from the eCommerce platform.
  // const apiProxy = createProxyMiddleware({
  //   target: `https://${process.env.MANAGER_HOSTNAME!}`,
  //   changeOrigin: true,
  //   pathFilter: ["**", "!/app/**", "!/exitiframe**"],
  //   logger: console,
  //   cookieDomainRewrite: process.env.PUBLIC_HOSTNAME!,
  //   on: {
  //     proxyReq: (proxyReq, req, res) => {
  //       const queryParams = new URLSearchParams(req.url?.split("?")[1]);
  //       if (queryParams.has("id_token")) {
  //         const idToken = queryParams.get("id_token")!;
  //         proxyReq.setHeader("Authorization", `${idToken}`);
  //       }
  //       if (queryParams.has("host")) {
  //         const host = queryParams.get("host")!;
  //         proxyReq.setHeader("x-shopify-host", `${host}`);
  //       }
  //       proxyReq.end();
  //     },
  //   },
  //   pathRewrite: (path, req) => {
  //     // Parse path query
  //     const query = path.split("?")[1];
  //     const params = new URLSearchParams(query);
  //     if (params.has("shop")) {
  //       // Add custom token
  //       const shop = params.get("shop")!;
  //       const token = Container.customTokens[shop];
  //       if (token) {
  //         params.set("id_token", token);
  //         path = path.split("?")[0] + "?" + params.toString();
  //       }
  //     }
  //     return path;
  //   },
  // });
  //
  // app.use(
  //   async (req, res, next) => {
  //     const shop = req.query["shop"] as string;
  //
  //     console.log("PATH", req.path);
  //
  //     if (
  //       req.path.startsWith("/_next") ||
  //       !shop ||
  //       req.path.startsWith("/app/webhooks")
  //     ) {
  //       // Skip authentication for next.js files or (temporarily - debug) if no shop is specified
  //       apiProxy(req, res, next);
  //       return;
  //     }
  //
  //     console.log("SHOP", shop);
  //     console.log("next");
  //
  //     // Verify hmac
  //     const hmac = req.query["hmac"] as string;
  //     const params = { ...req.query };
  //     delete params["hmac"];
  //     const message = Object.keys(params)
  //       .map((key) => `${key}=${params[key]}`)
  //       .sort()
  //       .join("&");
  //     const generatedHash = createHmac(
  //       "sha256",
  //       process.env.SHOPIFY_API_SECRET_KEY!,
  //     );
  //     generatedHash.update(message);
  //     const generatedHashString = generatedHash.digest("hex");
  //     if (generatedHashString !== hmac) {
  //       res.status(401).send("Invalid HMAC");
  //       return;
  //     }
  //
  //     const session = await Container.shopifyService.getSession(
  //       shopifyApp.api.session.getOfflineId(shop),
  //     );
  //
  //     if (session) {
  //       const response = await shopifyApp.api.webhooks.register({
  //         session: session,
  //       });
  //       console.log("Webhook registration response", response);
  //       //todo, gracefuly handle what happens if they error?
  //     }
  //
  //     if (session) {
  //       const store = await Container.shopifyStoreService.findStoreByDomain(
  //         shop,
  //       );
  //       if (!store && session.accessToken) {
  //         console.log("Creating store (again?)");
  //         await Container.shopifyStoreService.upsertStore(
  //           shop,
  //           session.accessToken,
  //           session.scope?.split(",") ?? [],
  //         );
  //       }
  //
  //       const authedClient = CloudshelfClientFactory.getClient(shop);
  //       const customTokenQuery = await authedClient.query<
  //         ExchangeTokenQuery,
  //         ExchangeTokenQueryVariables
  //       >({
  //         query: ExchangeTokenDocument,
  //         variables: {
  //           domain: shop,
  //         },
  //       });
  //       if (customTokenQuery.data?.customToken) {
  //         // Add the custom token to the map. This ensures that proxy requests always access the most recent custom
  //         // token.
  //         Container.customTokens[shop] = customTokenQuery.data.customToken;
  //       }
  //     }
  //
  //     next();
  //   },
  //   async (req, res, next) => {
  //     const shop = req.query["shop"] as string;
  //
  //     if (req.path.startsWith("/app/webhooks") || !shop) {
  //       next();
  //       return;
  //     }
  //     shopifyApp.ensureInstalledOnShop()(req, res, next);
  //   },
  //   apiProxy,
  // );
  ///////

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
