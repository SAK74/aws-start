import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { sharedLambdaProps } from "./product-service";

export class AuthServiceStack extends cdk.Stack {
  authorizer: apiGateway.IAuthorizer;
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

    new cdk.CfnOutput(this, "authorizer-output", {
      value: authorizerLambda.functionArn,
      exportName: "AuthStack:AuthorizerId",
    });
  }
}
