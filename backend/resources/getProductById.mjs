import { buildResp } from "./utils/buildResponse.mjs";
import { RequiredMethodError } from "./utils/requiredMethodError.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getProductCount } from "./utils/getProductCount.mjs";

const client = new DynamoDBClient({ region: "eu-north-1" });
const documentClient = DynamoDBDocumentClient.from(client);

/**
 *
 * @param {APIGatewayEvent} event
 */

export const handler = async (event) => {
  console.log(`Method: ${event.httpMethod}\nPath: ${event.path}`);

  const { id } = event.pathParameters;
  try {
    if (event.httpMethod !== "GET") {
      throw new RequiredMethodError();
    }
    if (!id) {
      const err = new Error("Wwrong or missed ID!");
      err.name = "wrongId";
      throw err;
    }
    const product = (
      await documentClient.send(
        new GetCommand({
          TableName: process.env.PRODUCTS_TABLE_NAME,
          Key: { id },
        })
      )
    ).Item;

    if (!product) {
      const err = new Error("Product not found!");
      err.name = "wrongId";
      throw err;
    }
    const count = await getProductCount(id);

    return buildResp(200, { ...product, count });
  } catch (err) {
    let status = 500;
    if (err instanceof RequiredMethodError) {
      status = 400;
    }
    if (err.name === "wrongId") {
      status = 404;
    }
    return buildResp(status, err.message || "Unknown server error");
  }
};
