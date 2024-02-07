import { buildResp } from "./utils/buildResponse";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent, Handler } from "aws-lambda";
import { createTransaction } from "./utils/createTransaction";

const client = new DynamoDBClient({ region: "eu-north-1" });
const documentClient = DynamoDBDocumentClient.from(client);

export const handler: Handler<APIGatewayEvent> = async (event) => {
  console.log(
    `Method: ${event.httpMethod}\nPath: ${event.path}\nBody: ${event.body}`
  );

  const data = JSON.parse(event.body || "{}");
  if (!data.title || !data.price || !data.description || !data.count) {
    return buildResp(400, "Product data are invalid!");
  }

  try {
    const command = new TransactWriteCommand({
      TransactItems: createTransaction(data),
    });

    const resp = (await documentClient.send(command)).$metadata;

    return buildResp(201, resp);
  } catch (err) {
    console.log(err);
    return buildResp(500, (err as Error).message || "Unknown server error...");
  }
};
