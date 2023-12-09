import { buildResp } from "./utils/buildResponse.js";
import { RequiredMethodError } from "./utils/requiredMethodError.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getProductCount } from "./utils/getProductCount.js";
import { APIGatewayEvent } from "aws-lambda";

const client = new DynamoDBClient({ region: "eu-north-1" });
const documentClient = DynamoDBDocumentClient.from(client);

/**
 *
 * @param {APIGatewayEvent} event
 */

export const handler = async (event: APIGatewayEvent) => {
  console.log(`Method: ${event.httpMethod}\nPath: ${event.path}`);
  try {
    if (event.httpMethod !== "GET") {
      throw new RequiredMethodError();
    }
    const products = (
      await documentClient.send(
        new ScanCommand({
          TableName: process.env.PRODUCTS_TABLE_NAME,
        })
      )
    ).Items;

    if (!products) {
      throw new Error("No products available..");
    }

    const completeList = await Promise.all(
      products.map(async (product) => {
        const count = await getProductCount(product.id);
        return { ...product, count };
      })
    );
    return buildResp(200, completeList);
  } catch (err) {
    let status = 500;
    if (err instanceof RequiredMethodError) {
      status = 400;
    }
    console.error(err);
    return buildResp(status, (err as Error).message || "Unknown server error");
  }
};
