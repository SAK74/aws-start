#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductService } from "../lib/product-service";
import { ImportServiceStack } from "../lib/import-service";
import "dotenv/config";

const app = new cdk.App();

const importService = new ImportServiceStack(app, "import-service", {});

new ProductService(app, "product-service", {
  catalogItemsQueue: importService.catalogItemsQueue,
});

app.synth();
