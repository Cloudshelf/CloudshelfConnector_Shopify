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

          //after callback, direct to a page that does an authenticated fetch.
          res.redirect("https://admin.shopify.com/store/cs-connector-store/apps/cloudshelf-connector-ash/app/auth/fetch");
      },
    //requestBilling
    shopify.redirectToShopifyOrAppRoot(),
  );

  /*app.post(
    shopify.config.webhooks.path,
    shopify.processWebhooks({ webhookHandlers }),
  );*/

    //I tried to get this to work, the Auth JWT is in the request, but getSession returns null (session does work tho)
    app.get("/shopify/cb",
    async (req, res, next) => {
    console.log('cb')


    // console.log(req);
    const sessionId = await shopify.api.session.getCurrentId({
        isOnline: false,
        rawRequest: req,
        rawResponse: res,
    });
    console.log('SessionId 2', sessionId);

    if (sessionId) {
        const session = await shopifyService.getSession(sessionId);

        console.log('SESSION 2: ', session);
    }

    res.end(`cb`);
});


app.get("/app/auth/fetch", async (req, res) => {
    res.end(`
        <html>
            <head>
                <meta name="shopify-api-key" content="f523d26314100500673f6dc5cf12cba0" />
                <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" ></script>
                <script>
                    //use app bridge to show loading
                    shopify.loading(true);
                    //use app bright to call a request at the connector
                    //We have to then fetch something
                    //fetch is a global thing created by the app bridge, and it includes the auth headers that sessions apparently need.
                    fetch('https://connector.yacker.io/shopify/cb');
                    
                    //after a successful fetch, we can we are done?
                </script>
            </head>
            <body>
                <p>authed fetch<p/>
            </body>
        </html>
      `);
});

  app.get("/app/exitiframe", (req, res) => {
    const params = req.query;
    const redirectUri = (params["redirectUri"] ?? "") as string;
      const fullUrl = `${redirectUri}`;
      //if not embedded, we need to provide more of the url
      // const fullUrl = `https://connector.yacker.io/${redirectUri}`;
    console.log(
      "Exiting iframe to: " +
        fullUrl +
        " (debug - you will need to click the link manually the first time each time you restart this app because of in memory storage)",
    );

      res.end(`
        <html>
<!--            <head>-->
<!--                <meta name="shopify-api-key" content="f523d26314100500673f6dc5cf12cba0" />-->
<!--                <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" ></script>-->
<!--                <script>-->
<!--                    //use app bridge to show loading-->
<!--                    shopify.loading(true);-->
<!--                    //use app bright to call a request at the connector-->
<!--                    //We have to then fetch something-->
<!--                    //fetch is a global thing created by the app bridge, and it includes the auth headers that sessions apparently need.-->
<!--                    fetch('https://connector.yacker.io/shopify/cb');-->
<!--                </script>-->
<!--            </head>-->
<!--            <script>window.location.href = '${fullUrl}'</script>-->
            <body>
                <p>You need to oauth: ${fullUrl}, and then fetch with authedFetch<p/>
            </body>
        </html>
      `);

      // res.end(`<html><body><p>Redirecting to ${fullUrl}</p><script>window.location.href = '${fullUrl}'</script></body></html>`);
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
        console.log('sessionId 1:', sessionId);

        if(sessionId) {
            const session = await shopifyService.getSession(sessionId);

            console.log('SESSION 1: ', session);
        }

        next();
    },
    shopify.ensureInstalledOnShop(), //this is only needed for embeeded
    apiProxy,
  );

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
