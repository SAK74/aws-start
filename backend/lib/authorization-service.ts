import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { sharedLambdaProps } from "./product-service";

export class AuthServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authorizerLambda = new lambda.Function(
      this,
      "simply-authorizer-function",
      {
        ...sharedLambdaProps,
        code: lambda.Code.fromAsset("dist/basicAuthorizer"),
        handler: "basicAuthorizer.handler",
        environment: {
          SAK74: process.env.SAK74 || "",
        },
      }
    );

    const authorizer = new apiGateway.TokenAuthorizer(
      this,
      "simply-authorizer",
      {
        handler: authorizerLambda,
        identitySource: "method.request.header.Authorization",
      }
    );

    // to remove
    const testHandler = new lambda.Function(this, "test-handler", {
      ...sharedLambdaProps,
      code: lambda.Code.fromAsset("dist/test-handler"),
      handler: "test-handler.handler",
    });

    const api = new apiGateway.RestApi(this, "auth-api", {});
    api.root.addMethod(
      lambda.HttpMethod.GET,
      new apiGateway.LambdaIntegration(testHandler),
      {
        authorizer,
      }
    );
  }
}
