import * as dotenv from "dotenv";
import type { CodegenConfig } from "@graphql-codegen/cli";

dotenv.config();

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.CLOUDSHELF_API_URL,
  generates: {
    "src/graphql/cloudshelf/generated/cloudshelf.ts": {
      plugins: [
        "typescript",
        "typescript-document-nodes",
        "typescript-operations",
      ],
      config: {
        nameSuffix: "Document",
      },
    },
    "src/graphql/cloudshelf/generated/cloudshelf.schema.json": {
      plugins: ["introspection"],
    },
  },
  documents: "src/graphql/cloudshelf/**/*.graphql",
};

export default config;
