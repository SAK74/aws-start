import { DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { stdin, stdout } from "node:process";
import * as readline from "node:readline/promises";
import "dotenv/config";

const client = new DynamoDBClient({ region: "eu-north-1" });

const deleteTable = async (tableName: string) => {
  const resp = await client.send(
    new DeleteTableCommand({ TableName: tableName })
  );
  console.log(tableName, JSON.stringify(resp, null, 2));
};

const go = async () => {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });
  const answer = await rl.question("Are you sure to delete ALL tables! (y/n)?");
  if (answer !== "y") {
    process.exit(1);
  }
  try {
    await deleteTable(process.env.PRODUCTS_TABLE_NAME || "");
    await deleteTable(process.env.STOCK_TABLE_NAME || "");
    process.exit(0);
  } catch (err) {
    console.log("Error!", (err as Error).message);
  }
};

go();
