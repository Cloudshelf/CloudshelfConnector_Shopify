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

  const { shopify } = container.resolve(ShopifyService);
  console.log("Auth path:", shopify.config.auth.path);
  app.get(shopify.config.auth.path, shopify.auth.begin());
  app.get(
    shopify.config.auth.callbackPath,
    shopify.auth.callback(),
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
    console.log("Exiting iframe to: " + redirectUri);
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
    /*pathRewrite: (path, req) => {
      /!*return path
        .replace("embedded=1", "")
        .replace("hmac", "hhmac")
        .replace("session", "sesssssion")
        .replace("shop", "shhhop");*!/
    },*/
    logger: console,
  });
  app.use((req, res, next) => {
    console.log("PATH", req.path);
    if (req.path.startsWith("/_next") || !req.params["shop"]) {
      next();
      return;
    }
    return shopify.ensureInstalledOnShop()(req, res, next);
  }, apiProxy);

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
