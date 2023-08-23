import * as dotenv from "dotenv";
import type { CodegenConfig } from "@graphql-codegen/cli";

dotenv.config();

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    [process.env.SHOPIFY_API_URL!]: {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
      },
    },
  },
  generates: {
    "src/graphql/shopify/generated/shopify.ts": {
      plugins: [
        "typescript",
        "typescript-document-nodes",
        "typescript-operations",
      ],
      config: {
        nameSuffix: "Document",
      },
    },
    "src/graphql/shopify/generated/shopify.schema.json": {
      plugins: ["introspection"],
    },
  },
  documents: "src/graphql/shopify/**/*.graphql",
};

export default config;
