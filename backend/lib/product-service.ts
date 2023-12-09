import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as gatewayapi from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { LambdaFunctionProps } from "aws-cdk-lib/aws-events-targets";

export const cors: gatewayapi.CorsOptions = {
  allowOrigins: gatewayapi.Cors.ALL_ORIGINS,
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "X-Amz-Date",
    "X-Api-Key",
    "X-Amz-Security-Token",
    "X-Amz-User-Agent",
  ],
  allowCredentials: true,
};

const sharedLambdaProps: Omit<cdk.aws_lambda.FunctionProps, "handler"> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  code: lambda.Code.fromAsset("dist"),
};

export class ProductService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductList = new lambda.Function(this, "get-products-list", {
      ...sharedLambdaProps,
      handler: "getProductsList.handler",
    });

    const api = new gatewayapi.RestApi(this, "products-api", {
      restApiName: "product-api",
      deployOptions: {
        stageName: "dev",
      },
    });

    const productsListIntegration = new gatewayapi.LambdaIntegration(
      getProductList,
      {
        requestTemplates: {
          "application/json": '{"statusCode":"200"}',
        },
      }
    );

    const productsList = api.root.addResource("products");
    productsList.addMethod("GET", productsListIntegration);
    productsList.addCorsPreflight(cors);

    const getProductById = new lambda.Function(this, "get product-by-id", {
      ...sharedLambdaProps,
      handler: "getProductById.handler",
    });

    const productByIdIntegraion = new gatewayapi.LambdaIntegration(
      getProductById,
      {
        requestTemplates: {
          "application/json": '{"statusCode":"200"}',
        },
      }
    );

    const productById = productsList.addResource("{id}");
    productById.addMethod("GET", productByIdIntegraion);
    productById.addCorsPreflight(cors);

    const createProduct = new lambda.Function(this, "create-product", {
      ...sharedLambdaProps,
      handler: "createProduct.handler",
    });

    const createProductIntegration = new gatewayapi.LambdaIntegration(
      createProduct,
      {
        requestTemplates: {
          "application/json": '{"statusCode":"200"}',
        },
      }
    );

    productsList.addMethod("POST", createProductIntegration);

    const policy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      "AmazonDynamoDBFullAccess"
    );

    [getProductList, getProductById, createProduct].forEach((lambda) => {
      lambda.role?.addManagedPolicy(policy);
      lambda.addEnvironment("PRODUCTS_TABLE_NAME", "Products");
      lambda.addEnvironment("STOCK_TABLE_NAME", "Stock");
    });

    const catalogBatchProcessLambda = new lambda.Function(
      this,
      "catalog-batch-process",
      {
        ...sharedLambdaProps,
        handler: "catalogBatchProcess.handler",
      }
    );
  }
}
