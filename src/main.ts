import "reflect-metadata";
import * as dotenv from "dotenv";
import express, { Request, Response, NextFunction, Express } from "express";
import validate from "./utils/request-validator";
import { container } from "tsyringe";
import { DatabaseService } from "./modules/database/Database";
import { RequestContext } from "@mikro-orm/core";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createExpressServer } from "routing-controllers";
import { ShopifyStoreController } from "./modules/shopifyStore/shopify-store.controller";
import { DebugController } from "./modules/debug/debug.controller";
import { ShopifyService } from "./modules/shopify/shopify.service";

dotenv.config();

(async () => {
  const app: Express = createExpressServer({
    controllers: [ShopifyStoreController, DebugController],
    routePrefix: "/app",
  });
  const port = process.env.PORT || 3123;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const databaseService = container.resolve(DatabaseService);
  await databaseService.initialise();

  const shopifyService = container.resolve(ShopifyService);
  const shopify = shopifyService.shopify;
  console.log("Auth path:", shopify.config.auth.path);
  app.get(shopify.config.auth.path, shopify.auth.begin());
  app.get(
    shopify.config.auth.callbackPath,
    (req: Request, res: Response, next: NextFunction) => {
      console.log("Before callback");
      next();
    },
    shopify.auth.callback(),
    (req: Request, res: Response, next: NextFunction) => {
      console.log("After callback");
      next();
    },
    shopify.redirectToShopifyOrAppRoot(),
  );
  /*app.post(
    shopify.config.webhooks.path,
    shopify.processWebhooks({ webhookHandlers }),
  );*/

  /*app.get("/", shopify.ensureInstalledOnShop(), (req, res) => {
    res.send("Installed successfully");
  });*/

  app.get("/app/exitiframe", (req, res) => {
    //res.send("Exit iframe");
    const params = req.query;
    const redirectUri = (params["redirectUri"] ?? "") as string;
    console.log(
      "Exiting iframe to: " +
        redirectUri +
        " (debug - you will need to click the link manually the first time each time you restart this app because of in memory storage)",
    );
    //res.redirect(redirectUri);
    res.end(
      '<html><body><p>Redirecting...</p><script>window.open("' +
        redirectUri +
        '"</script></body></html>',
    );
  });

  app.use((req, res, next) => {
    RequestContext.create(databaseService.getOrm().em, next);
  });

  // We proxy all requests except those prefixed with /app to the Cloudshelf Manager, so that the app can be embedded in
  // Shopify's Admin panel transparently. Most eCommerce connectors will not need to do this as apps will be hosted
  // separately from the eCommerce platform.
  const apiProxy = createProxyMiddleware({
    target: "https://development.manager.cloudshelf.ai",
    changeOrigin: true,
    pathFilter: ["**", "!/app/**", "!/exitiframe**"],
    logger: console,
  });
  app.use(
    (req, res, next) => {
      console.log("PATH", req.path);
      const session = req.query["session"] as string;
      const shop = req.query["shop"] as string;
      console.log("SHOP", shop);
      if (req.path.startsWith("/_next") || !shop) {
        // Skip authentication for next.js files or (temporarily - debug) if no shop is specified
        apiProxy(req, res, next);
        return;
      }

      console.log("next");

      shopify.api.session
        .getCurrentId({
          rawResponse: res,
          rawRequest: req,
          isOnline: true, // also doesnt work with false :)
        })
        .then((id) => console.log("Session id: ", id));
      shopifyService
        .getSession(session)
        .then((sess) => console.log("Session: ", sess));

      next();
    },
    shopify.ensureInstalledOnShop(),
    apiProxy,
  );

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
