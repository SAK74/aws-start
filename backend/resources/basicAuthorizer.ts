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

  const [user, password] = Buffer.from(splitedToken[1], "base64")
    .toString("utf-8")
    .split(":");
  console.log("user: ", user);
  console.log("password: ", password);
  const approved = Boolean(process.env[user]) && process.env[user] === password;
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
