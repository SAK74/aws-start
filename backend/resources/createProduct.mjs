import { buildResp } from "./utils/buildResponse.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({ region: "eu-north-1" });
const documentClient = DynamoDBDocumentClient.from(client);

/**
 *
 * @param {APIGatewayEvent} event
 */

export const handler = async (event) => {
  console.log(
    `Method: ${event.httpMethod}\nPath: ${event.path}\nBody: ${event.body}`
  );

  const data = JSON.parse(event.body || "{}");
  if (!data.title || !data.price || !data.description || !data.count) {
    return buildResp(400, "Product data are invalid!");
  }
  const { count, ...product } = data;

  try {
    const id = randomUUID();

    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.STOCK_TABLE_NAME,
            Item: { product_id: id, count },
          },
        },
        {
          Put: {
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Item: { ...product, id },
          },
        },
      ],
    });

    const resp = (await documentClient.send(command)).$metadata;

    return buildResp(200, resp);
  } catch (err) {
    return buildResp(500, err.message || "Unknown server error...");
  }
};
