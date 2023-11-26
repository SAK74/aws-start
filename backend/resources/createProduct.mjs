import { buildResp } from "./utils/buildResponse.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({ region: "eu-north-1" });
const documentClient = DynamoDBDocumentClient.from(client);

/**
 *
 * @param {APIGatewayEvent} event
 */

export const handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    if (!data.title || !data.price || !data.description || !data.count) {
      return buildResp(400, "Product data are invalid!");
    }

    const { count, ...product } = data;
    const id = randomUUID();
    documentClient.send(
      new PutCommand({
        TableName: process.env.STOCK_TABLE_NAME,
        Item: { product_id: id, count },
      })
    );
    const resp = (
      await documentClient.send(
        new PutCommand({
          TableName: process.env.PRODUCTS_TABLE_NAME,
          Item: { ...product, id },
        })
      )
    ).$metadata;

    return buildResp(200, resp);
  } catch (err) {
    return buildResp(500, err.message || "Unknown server error...");
  }
};
