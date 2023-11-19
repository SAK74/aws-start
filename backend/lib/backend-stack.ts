import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as gatewayapi from "aws-cdk-lib/aws-apigateway";

export class ProductService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductList = new lambda.Function(this, "get-products-list", {
      runtime: lambda.Runtime.NODEJS_18_X,

      code: lambda.Code.fromAsset("resources"),
      handler: "getProductsList.handler",
    });

    const api = new gatewayapi.RestApi(this, "products-api", {
      restApiName: "product-api",
      deployOptions: {
        stageName: "develop",
      },
    });

    const productsListIntegration = new gatewayapi.LambdaIntegration(
      getProductList,
      {
        // requestTemplates: {
        //   "application/json": '{"statusCode":"200"}',
        // },
      }
    );

    // api.root.addMethod("GET", integration);
    const productsList = api.root.addResource("products");
    productsList.addMethod("GET", productsListIntegration);

    const getProductById = new lambda.Function(this, "get product-by-id", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "getProductById.handler",
    });

    const productByIdIntegraion = new gatewayapi.LambdaIntegration(
      getProductById
    );

    const productById = productsList.addResource("{id}");
    productById.addMethod("GET", productByIdIntegraion);
  }
}
