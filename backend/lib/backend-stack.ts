import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as gatewayapi from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";

export class ProductService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductList = new lambda.Function(this, "get-products-list", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "getProductsList.handler",
      environment: {
        PRODUCTS_TABLE_NAME: "Products",
        STOCK_TABLE_NAME: "Stock",
      },
    });

    const policy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      "AmazonDynamoDBFullAccess"
    );

    getProductList.role?.addManagedPolicy(policy);

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
    productsList.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["GET", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Amz-Date",
        "X-Api-Key",
        "X-Amz-Security-Token",
        "X-Amz-User-Agent",
      ],
      allowCredentials: true,
    });

    const getProductById = new lambda.Function(this, "get product-by-id", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("resources"),
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
    productById.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["GET", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Amz-Date",
        "X-Api-Key",
        "X-Amz-Security-Token",
        "X-Amz-User-Agent",
      ],
      allowCredentials: true,
    });
  }
}
