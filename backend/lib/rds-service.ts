import { Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { cors, sharedLambdaProps } from "./product-service";
import * as apigw from "aws-cdk-lib/aws-apigateway";

export class RDSServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaHandler = new lambda.Function(this, "nest-handler", {
      ...sharedLambdaProps,
      code: lambda.Code.fromAsset("dist/nest-rds"), // nest-rds/dist
      handler: "main.handler",
      environment: {
        DATABASE_URL: process.env.DATABASE_URL || "",
      },
    });

    const api = new apigw.RestApi(this, "nest-access-api", {
      deployOptions: {
        stageName: "dev",
      },
    });

    api.root.addProxy({
      defaultIntegration: new apigw.LambdaIntegration(lambdaHandler),
      anyMethod: true,
      defaultCorsPreflightOptions: cors,
    });
  }
}
