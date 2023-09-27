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
import { ShopifyStoreService } from "./modules/shopifyStore/shopify-store.service";

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

      //after callback, direct to a page that does an authenticated fetch.
      res.redirect(
        `https://admin.shopify.com/store/cs-connector-store/apps/${process.env.APP_SLUG}/app/auth/fetch`,
      );
    },
    //requestBilling
    shopify.redirectToShopifyOrAppRoot(),
  );

  /*app.post(
    shopify.config.webhooks.path,
    shopify.processWebhooks({ webhookHandlers }),
  );*/

  app.get("/shopify/cb", async (req, res, next) => {
    const sessionId = await shopify.api.session.getCurrentId({
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });

    if (sessionId) {
      const session = await shopifyService.getSession(sessionId);
      if (!session || !session.shop || !session.accessToken) {
        return;
      }
      // Store access token!
      const storeService = container.resolve(ShopifyStoreService);
      const store = await storeService.findStoreByDomain(
        databaseService.getOrm(),
        session?.shop ?? "",
      );
      if (!store) {
        await storeService.createStore(
          databaseService.getOrm(),
          session.shop,
          session.accessToken,
        );
      }
    }

    res.end(`cb`);
  });

  app.get("/app/auth/fetch", async (req, res) => {
    res.end(`
        <html>
            <head>
                <meta name="shopify-api-key" content="${process.env.SHOPIFY_API_KEY}" />
                <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" ></script>
                <script>
                    shopify.loading(true); 
                    fetch('https://cs.arcanaeum.me/shopify/cb').then(() => {
                        open('https://admin.shopify.com/store/cs-connector-store/apps/${process.env.APP_SLUG}/', '_top');
                    });
                </script>
                <style>
                    body {
                        padding: 24px;
                        font-family: sans-serif;
                        display: flex;
                        flex-direction: column;
                        gap: 24px;
                        align-items: center;
                    }
                </style>
            </head>
            <body>
                <img src="https://development.manager.cloudshelf.ai/img/cloudshelf_long_logo.svg" alt="Cloudshelf" width="243px"/>
                <p>Loading...</p>
            </body>
        </html>
      `);
  });

  app.get("/app/exitiframe", (req, res) => {
    const params = req.query;
    const redirectUri = (params["redirectUri"] ?? "") as string;
    const fullUrl = `${redirectUri}`;

    res.end(`
        <html>
            <head>
                <style>
                    body {
                        padding: 24px;
                        font-family: sans-serif;
                        display: flex;
                        flex-direction: column;
                        gap: 24px;
                        align-items: center;
                    }
                </style>
                <meta name="shopify-api-key" content="${process.env.SHOPIFY_API_KEY}" />
                <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
                <script>
                    shopify.loading(true);
                    open('${fullUrl}', '_top');
                </script>
            </head>
            <body>
                <img src="https://development.manager.cloudshelf.ai/img/cloudshelf_long_logo.svg" alt="Cloudshelf" width="243px"/>
                <p>Loading...</p>
            </body>
        </html>
      `);
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
    // shopify.validateAuthenticatedSession(), //this is needed for non-embedded
    async (req, res, next) => {
      const session = req.query["session"] as string;
      const shop = req.query["shop"] as string;

      console.log("PATH", req.path);

      if (req.path.startsWith("/_next") || !shop) {
        // Skip authentication for next.js files or (temporarily - debug) if no shop is specified
        apiProxy(req, res, next);
        return;
      }

      console.log("SHOP", shop);
      console.log("next");

      const sessionId = await shopify.api.session.getCurrentId({
        isOnline: false,
        rawRequest: req,
        rawResponse: res,
      });
      console.log("sessionId 1:", sessionId);

      if (sessionId) {
        const session = await shopifyService.getSession(sessionId);

        console.log("SESSION 1: ", session);
      }

      next();
    },
    shopify.ensureInstalledOnShop(), //this is only needed for embeeded
    apiProxy,
  );

  app.get("/app/delsess", async (req, res, next) => {
    /* DEBUG */
    shopifyService.deleteAllSessions("cs-connector-store.myshopify.com");
    res.send("done");
  });

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
