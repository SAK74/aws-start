import { TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Product } from "../../types";
import { randomUUID } from "crypto";

export const createTransaction: (
  data: Product
) => TransactWriteCommandInput["TransactItems"] = (data) => {
  if (!data.count || !data.description || !data.price || !data.title) {
    throw new Error("Wrong data format");
  }
  const id = randomUUID();
  const { count, ...product } = data;
  return [
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
  ];
};
