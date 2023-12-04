import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { products } from "./data";

const client = new DynamoDBClient({ region: "eu-north-1" });

const documentClient = DynamoDBDocumentClient.from(client);

const main = () => {
  products.forEach(async (product) => {
    const id = randomUUID();
    let resp = await documentClient.send(
      new PutCommand({
        TableName: "Products",
        Item: { ...product, id },
      })
    );
    console.log(resp);

    resp = await documentClient.send(
      new PutCommand({
        TableName: "Stock",
        Item: { product_id: id, count: Math.round(Math.random() * 4 + 1) },
      })
    );
  });
};

main();
