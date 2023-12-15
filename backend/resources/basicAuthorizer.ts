import {
  APIGatewayAuthorizerHandler,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { Buffer } from "buffer";

export const handler: APIGatewayAuthorizerHandler = async (event) => {
  console.log("Event: ", event);

  const credentials = (
    event as APIGatewayTokenAuthorizerEvent
  ).authorizationToken.split(" ")[1];

  const decoded = Buffer.from(credentials, "base64")
    .toString("utf-8")
    .split(":");
  console.log("decoded: ", decoded);
  const approved = process.env[decoded[0]] === decoded[1];

  return {
    principalId: "user",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: approved ? iam.Effect.ALLOW : iam.Effect.DENY,
          Resource: event.methodArn,
        },
      ],
    },
  };
};
