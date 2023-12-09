#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductService } from "../lib/product-service";
import { ImportServiceStack } from "../lib/import-service";

const app = new cdk.App();
new ProductService(app, "product-service", {});
new ImportServiceStack(app, "import-service", {});
app.synth();
