import { Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { cors, sharedLambdaProps } from "./product-service";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
// import { HttpMethod } from "aws-cdk-lib/aws-events";
import * as path from "path";

export class RDSServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaHandler = new lambda.Function(this, "nest-handler", {
      ...sharedLambdaProps,
      code: lambda.Code.fromAsset("dist/nest-rds"),
      handler: "main.handler",
    });

    // const lambdaHandler = new NodejsFunction(this, "nest-handler", {
    //   ...sharedLambdaProps,
    //   entry: path.resolve(__dirname, "../nest-rds/src/main.ts"),
    //   handler: "handler",
    // });

    const api = new apigw.RestApi(this, "nest-access-api", {
      // defaultIntegration: new apigw.LambdaIntegration(lambdaHandler, {}),
      defaultCorsPreflightOptions: cors,
      deployOptions: {
        stageName: "dev",
      },
    });
    api.root.addMethod("ANY", new apigw.LambdaIntegration(lambdaHandler, {}));
    api.root.addProxy();
  }
}
