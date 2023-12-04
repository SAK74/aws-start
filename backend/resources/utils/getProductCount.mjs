import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });
const documentClient = DynamoDBDocumentClient.from(client);

export const getProductCount = async (id) =>
  (
    await documentClient.send(
      new GetCommand({
        TableName: process.env.STOCK_TABLE_NAME,
        Key: { product_id: id },
      })
    )
  ).Item.count;
