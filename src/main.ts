import "reflect-metadata";
import * as dotenv from "dotenv";
import express, { Request, Response, NextFunction, Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createExpressServer } from "routing-controllers";
import { ShopifyStoreController } from "./modules/shopifyStore/shopify-store.controller";
import { DebugController } from "./modules/debug/debug.controller";
import { registerQueues } from "./modules/queue/queue.registration";
import { generateHtmlPayload } from "./generateHtmlPayload";
import { getShopIdFromRequest } from "./utils/request-params";
import { Container } from "./container";
import { createHmac } from "crypto";
import { CloudshelfClientFactory } from "./modules/cloudshelfClient/CloudshelfClient";
import {
  ExchangeTokenDocument,
  ExchangeTokenQuery,
  ExchangeTokenQueryVariables,
} from "./graphql/cloudshelf/generated/cloudshelf";

dotenv.config();

const customTokens: { [domain: string]: string } = {};

(async () => {
  const app: Express = createExpressServer({
    controllers: [ShopifyStoreController, DebugController],
    routePrefix: "/app",
  });
  const port = process.env.PORT || 3123;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await Container.initialise();

  if (!Container.isInitialised) {
    throw new Error("Container was not configured");
  }
  await registerQueues();

  const shopifyApp = Container.shopifyService.shopifyApp;

  console.log("Auth path:", shopifyApp.config.auth.path);
  app.get(shopifyApp.config.auth.path, shopifyApp.auth.begin());
  app.get(
    shopifyApp.config.auth.callbackPath,
    (req: Request, res: Response, next: NextFunction) => {
      console.log("Before callback");
      next();
    },
    shopifyApp.auth.callback(),
    (req: Request, res: Response, next: NextFunction) => {
      console.log("After callback");

      //after callback, direct to a page that does an authenticated fetch.
      res.redirect(
        `https://admin.shopify.com/store/${getShopIdFromRequest(req)}/apps/${
          process.env.APP_SLUG
        }/app/auth/fetch`,
      );
    },
    //requestBilling
    shopifyApp.redirectToShopifyOrAppRoot(),
  );

  /*app.post(
    shopify.config.webhooks.path,
    shopify.processWebhooks({ webhookHandlers }),
  );*/

  app.get("/shopify/cb", async (req, res, next) => {
    const sessionId = await shopifyApp.api.session.getCurrentId({
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });

    if (sessionId) {
      const session = await Container.shopifyService.getSession(sessionId);
      if (!session || !session.shop || !session.accessToken) {
        return;
      }
      // Store access token!
      // const store = await Container.shopifyStoreService.findStoreByDomain(
      //   session?.shop ?? "",
      // );

      await Container.shopifyStoreService.upsertStore(
        session.shop,
        session.accessToken,
        session.scope?.split(",") ?? [],
      );
    }

    res.end(`cb`);
  });

  app.get("/app/auth/fetch", async (req, res) => {
    res.end(
      generateHtmlPayload({
        loadingText: "Authenticating your store",
        script: `
          fetch('https://${process.env.HOSTNAME}/shopify/cb').then(() => {
            open('https://admin.shopify.com/store/${getShopIdFromRequest(
              req,
            )}/apps/${process.env.APP_SLUG}/', '_top');
          });
        `,
      }),
    );
  });

  app.get("/app/exitiframe", (req, res) => {
    const params = req.query;
    const redirectUri = (params["redirectUri"] ?? "") as string;
    const fullUrl = `${redirectUri}`;

    res.end(
      generateHtmlPayload({
        loadingText: "Redirecting you to shopify installation",
        script: `
         open('${fullUrl}', '_top');
        `,
      }),
    );
  });

  // app.use((req, res, next) => {
  //   RequestContext.create(databaseService.getOrm().em, next);
  // });

  // We proxy all requests except those prefixed with /app to the Cloudshelf Manager, so that the app can be embedded in
  // Shopify's Admin panel transparently. Most eCommerce connectors will not need to do this as apps will be hosted
  // separately from the eCommerce platform.
  const apiProxy = createProxyMiddleware({
    target: `https://${process.env.MANAGER_HOSTNAME!}`,
    changeOrigin: true,
    pathFilter: ["**", "!/app/**", "!/exitiframe**"],
    logger: console,
    cookieDomainRewrite: process.env.HOSTNAME!,
    on: {
      proxyReq: (proxyReq, req, res) => {
        const queryParams = new URLSearchParams(req.url?.split("?")[1]);
        if (queryParams.has("id_token")) {
          const idToken = queryParams.get("id_token")!;
          proxyReq.setHeader("Authorization", `${idToken}`);
        }
        if (queryParams.has("host")) {
          const host = queryParams.get("host")!;
          proxyReq.setHeader("x-shopify-host", `${host}`);
        }
        proxyReq.end();
      },
    },
    pathRewrite: (path, req) => {
      // Parse path query
      const query = path.split("?")[1];
      const params = new URLSearchParams(query);
      if (params.has("shop")) {
        // Add custom token
        const shop = params.get("shop")!;
        const token = customTokens[shop];
        if (token) {
          params.set("id_token", token);
          path = path.split("?")[0] + "?" + params.toString();
        }
      }
      return path;
    },
  });

  app.use(
    //shopifyApp.validateAuthenticatedSession(), //this is needed for non-embedded
    async (req, res, next) => {
      const shop = req.query["shop"] as string;

      console.log("PATH", req.path);

      if (req.path.startsWith("/_next") || !shop) {
        // Skip authentication for next.js files or (temporarily - debug) if no shop is specified
        apiProxy(req, res, next);
        return;
      }

      // Verify hmac
      const hmac = req.query["hmac"] as string;
      const params = { ...req.query };
      delete params["hmac"];
      const message = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .sort()
        .join("&");
      const generatedHash = createHmac(
        "sha256",
        process.env.SHOPIFY_API_SECRET_KEY!,
      );
      generatedHash.update(message);
      const generatedHashString = generatedHash.digest("hex");
      if (generatedHashString !== hmac) {
        res.status(401).send("Invalid HMAC");
        return;
      }

      const session = await Container.shopifyService.getSession(
        shopifyApp.api.session.getOfflineId(shop),
      );

      if (session) {
        const store =
          await Container.shopifyStoreService.findStoreByDomain(shop);
        if (!store && session.accessToken) {
          console.log("Creating store (again?)");
          await Container.shopifyStoreService.upsertStore(
            shop,
            session.accessToken,
            session.scope?.split(",") ?? [],
          );
        }

        const authedClient = CloudshelfClientFactory.getClient(shop);
        const customTokenQuery = await authedClient.query<
          ExchangeTokenQuery,
          ExchangeTokenQueryVariables
        >({
          query: ExchangeTokenDocument,
          variables: {
            domain: shop,
          },
        });
        if (customTokenQuery.data?.customToken) {
          // Add the custom token to the map. This ensures that proxy requests always access the most recent custom
          // token.
          customTokens[shop] = customTokenQuery.data.customToken;
        }
      }

      next();
    },
    shopifyApp.ensureInstalledOnShop(), //this is only needed for embeeded
    apiProxy,
  );

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

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
