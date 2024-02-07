import { APIGatewayProxyHandler } from "aws-lambda";
import { buildResp } from "./utils/buildResponse";
import {
  DynamoDBDocumentClient,
  GetCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const documentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "eu-north-1" })
);
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE_NAME;
const STOCK_TABLE = process.env.STOCK_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;

  try {
    if (!id) {
      throw new Error("ID param missed!");
    }
    const item = (
      await documentClient.send(
        new GetCommand({
          TableName: PRODUCTS_TABLE,
          Key: { id },
        })
      )
    ).Item;
    if (!item) {
      return buildResp(404, "Product not found");
    }

    await documentClient.send(
      new TransactWriteCommand({
        TransactItems: [
          { Delete: { TableName: PRODUCTS_TABLE, Key: { id } } },
          {
            Delete: { TableName: STOCK_TABLE, Key: { product_id: id } },
          },
        ],
      })
    );
    return buildResp(200, "Product has been deleted successfully");
  } catch (err) {
    console.log(err);
    return buildResp(500, (err as Error).message);
  }
};
