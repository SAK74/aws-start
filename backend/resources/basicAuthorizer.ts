import {
  APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { Buffer } from "buffer";

export const handler: APIGatewayAuthorizerHandler = async (event) => {
  console.log("Event: ", event);

  const splitedToken = (
    event as APIGatewayTokenAuthorizerEvent
  ).authorizationToken.split(" ");
  if (!splitedToken[0].startsWith("Basic")) {
    return createResponse(false, event.methodArn);
  }

  const decoded = Buffer.from(splitedToken[1], "base64")
    .toString("utf-8")
    .split(":");
  console.log("decoded: ", decoded);
  const approved = process.env[decoded[0]] === decoded[1];
  return createResponse(approved, event.methodArn);
};

const createResponse: (
  approved: boolean,
  resource: string
) => APIGatewayAuthorizerResult = (approved, resource) => ({
  principalId: "user",
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: approved ? iam.Effect.ALLOW : iam.Effect.DENY,
        Resource: resource,
      },
    ],
  },
});
