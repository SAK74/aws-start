import { Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { cors, sharedLambdaProps } from "./product-service";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";

export class RDSServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaHandler = new lambda.Function(this, "nest-handler", {
      ...sharedLambdaProps,
      code: lambda.Code.fromAsset("nest-rds/dist"), // nest-rds/dist / dist/nest-rds
      handler: "main.handler",
      environment: {
        DATABASE_URL: process.env.DATABASE_URL || "",
      },
      timeout: cdk.Duration.seconds(10),
    });

    const api = new apigw.LambdaRestApi(this, "nest-access-api", {
      deployOptions: {
        stageName: "dev",
      },
      handler: lambdaHandler,
      defaultCorsPreflightOptions: cors,
      proxy: true,
    });

    // api.root.addProxy({
    //   defaultIntegration: new apigw.LambdaIntegration(lambdaHandler),
    //   anyMethod: true,
    //   defaultCorsPreflightOptions: {
    //     allowOrigins: apigw.Cors.ALL_ORIGINS,
    //     allowHeaders: apigw.Cors.DEFAULT_HEADERS,
    //     allowMethods: apigw.Cors.ALL_METHODS,
    //     allowCredentials: true,
    //   },
    // });
  }
}
