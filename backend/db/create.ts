import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });

const createProducts = new CreateTableCommand({
  TableName: "Products",
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  Tags: [{ Key: "description", Value: "training-db" }],
});

const createStock = new CreateTableCommand({
  TableName: "Stock",
  KeySchema: [{ AttributeName: "product_id", KeyType: "HASH" }],
  AttributeDefinitions: [{ AttributeName: "product_id", AttributeType: "S" }],
  ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
});

const main = async () => {
  try {
    const resp = await client.send(createProducts);
    console.log("Products table: ");
    console.log(JSON.stringify(resp, null, 2));
  } catch {}
  try {
    const resp = await client.send(createStock);
    console.log("Stock table: ");
    console.log(JSON.stringify(resp, null, 2));
  } catch {}
};

main();
