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
import { QueueService } from "./modules/queue/queue.service";

dotenv.config();

const registerQueues = () => {
  console.debug("Registering queues...");
  const queueService = container.resolve(QueueService);
  queueService.registerQueue("TEST", async (data) => {
    console.log("QUEUE DATA", data);
  });
  console.debug("Queues registration complete");
};

const generateHtmlPayload = (options?: {
  loadingText?: string;
  script?: string;
}) => {
  return `
    <html>
    <head>
        <meta name="shopify-api-key" content="${process.env.SHOPIFY_API_KEY}" />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" ></script>
        <script>
            shopify.loading(true); 
            ${options?.script ? `${options.script}` : ""}
        </script>
        <style>
            body {
                background: linear-gradient(120deg, #EC516C 8.16%, #EC9D51 119.67%);
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 20px;
            }
            p {
                color: #fff;
                font-family: 'Roboto', sans-serif;
                font-size: 20px;
            }
            .text {
                text-align: center;
            }
            .lds-roller {
              display: inline-block;
              position: relative;
              width: 80px;
              height: 80px;
            }
            .lds-roller div {
              animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
              transform-origin: 40px 40px;
            }
            .lds-roller div:after {
              content: " ";
              display: block;
              position: absolute;
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: #fff;
              margin: -4px 0 0 -4px;
            }
            .lds-roller div:nth-child(1) {
              animation-delay: -0.036s;
            }
            .lds-roller div:nth-child(1):after {
              top: 63px;
              left: 63px;
            }
            .lds-roller div:nth-child(2) {
              animation-delay: -0.072s;
            }
            .lds-roller div:nth-child(2):after {
              top: 68px;
              left: 56px;
            }
            .lds-roller div:nth-child(3) {
              animation-delay: -0.108s;
            }
            .lds-roller div:nth-child(3):after {
              top: 71px;
              left: 48px;
            }
            .lds-roller div:nth-child(4) {
              animation-delay: -0.144s;
            }
            .lds-roller div:nth-child(4):after {
              top: 72px;
              left: 40px;
            }
            .lds-roller div:nth-child(5) {
              animation-delay: -0.18s;
            }
            .lds-roller div:nth-child(5):after {
              top: 71px;
              left: 32px;
            }
            .lds-roller div:nth-child(6) {
              animation-delay: -0.216s;
            }
            .lds-roller div:nth-child(6):after {
              top: 68px;
              left: 24px;
            }
            .lds-roller div:nth-child(7) {
              animation-delay: -0.252s;
            }
            .lds-roller div:nth-child(7):after {
              top: 63px;
              left: 17px;
            }
            .lds-roller div:nth-child(8) {
              animation-delay: -0.288s;
            }
            .lds-roller div:nth-child(8):after {
              top: 56px;
              left: 12px;
            }
            @keyframes lds-roller {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }

        </style>
    </head>
    <body>
        <img src="https://imagedelivery.net/-f5bUQJUthKVRJ-ta9_Rcg/cb9b019f-6b04-41f9-be79-62c856668700/w=100,h=100,fit=scale-down,sharpen=1" alt="Cloudshelf" width="243px"/>
      
        <div class="lds-roller">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        
        <div class="text">
         <p>
            Please wait a moment
            ${options?.loadingText ? `<br/>${options.loadingText}` : ""}
         </p>
        </div>
    </body>
    </html>`;
};

(async () => {
  const app: Express = createExpressServer({
    controllers: [ShopifyStoreController, DebugController],
    routePrefix: "/app",
  });
  const port = process.env.PORT || 3123;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  registerQueues();

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
    res.end(
      generateHtmlPayload({
        loadingText: "Authenticating your store",
        script: `
          fetch('https://${process.env.HOSTNAME}/shopify/cb').then(() => {
            open('https://admin.shopify.com/store/cs-connector-store/apps/${process.env.APP_SLUG}/', '_top');
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

  app.get("/app/getsess", async (req, res, next) => {
    /* DEBUG */
    shopifyService.printAllSessions("cs-connector-store.myshopify.com");
    res.send("done");
  });

  app.get("/app/test", async (req, res, next) => {
    /* DEBUG */
    databaseService.getOrm();

    //A quick test area to test out code

    res.send("done test");
  });

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
