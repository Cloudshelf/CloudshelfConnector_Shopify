import { Express } from "express";
import { createThemeJob } from "../modules/queue/queues/theme/theme.job.functions";
import { Container } from "../container";

export function RegisterUtilRoutes(app: Express) {
  console.info("Registering util routes...");

  app.get("/crash", (req, res) => {
    throw new Error("Test crash");
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
