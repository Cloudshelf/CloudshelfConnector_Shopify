import "reflect-metadata";
import * as dotenv from "dotenv";
import express from "express";
import validate from "./utils/request-validator";
import { TestDto } from "./modules/test/test.dto";

dotenv.config();

const app = express();
const port = process.env.PORT || 3123;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", validate(TestDto), (req, res) => {
  res.send("Hello world.");
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
