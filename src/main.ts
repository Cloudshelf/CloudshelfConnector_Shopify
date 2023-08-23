import "reflect-metadata";
import * as dotenv from "dotenv";
import express from "express";
import validate from "./utils/request-validator";
import { TestDto } from "./modules/test/test.dto";
import { QueueService } from "./modules/queue/queue.service";
import { container } from "tsyringe";

dotenv.config();

(async () => {
  const app = express();
  const port = process.env.PORT || 3123;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post("/", validate(TestDto), (req, res) => {
    const input: TestDto = req.body;
    res.send("Hello world.");
  });

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
