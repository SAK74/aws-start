import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as gatewayapi from "aws-cdk-lib/aws-apigateway";
// import * as path from "node:path";
// import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// type Test = cdk.aws_lambda.Function

export class ProductService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, "lambda-handler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      // code: lambda.Code.fromAsset(
      //   path.resolve(__dirname, "./requestHandler.ts")
      // ),
      code: lambda.Code.fromAsset("resources"),
      handler: "handler.getProductList",
    });

    // const handler = new NodejsFunction(this, "handler", {
    //   bundling: {
    //     preCompilation: true,
    //   },
    // });

    const api = new gatewayapi.RestApi(this, "products-api", {
      restApiName: "product-api",
      // description:
      deployOptions: {
        stageName: "develop",
      },
    });

    // const api = new gatewayapi.LambdaRestApi(this, "lambda-api", {
    //   handler,
    // });

    const integration = new gatewayapi.LambdaIntegration(handler, {
      // requestTemplates: {
      //   "application/json": '{"statusCode":"200"}',
      // },
    });

    api.root.addMethod("GET", integration);

    // api.root.add

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BackendQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
