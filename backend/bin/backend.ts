#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductService } from "../lib/product-service";
import { ImportServiceStack } from "../lib/import-service";
import "dotenv/config";
import { AuthServiceStack } from "../lib/authorization-service";
import { RDSServiceStack } from "../lib/rds-service";

const app = new cdk.App();

new AuthServiceStack(app, "auth-service");

new ImportServiceStack(app, "import-service", {});

new ProductService(app, "product-service", {
  // catalogItemsQueue: importService.catalogItemsQueue,
});

new RDSServiceStack(app, "nest-rds-service", {});

app.synth();
