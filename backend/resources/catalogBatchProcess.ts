import { SQSEvent } from "aws-lambda";
import { SNSClient, PublishBatchCommand } from "@aws-sdk/client-sns";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { createTransaction } from "./utils/createTransaction";
import { Product } from "../types";

const snsClient = new SNSClient();

const dbClient = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler = async (event: SQSEvent) => {
  console.log("SQS event: ", JSON.stringify(event.Records));

  const allTransactions: TransactWriteCommandInput["TransactItems"] = [];
  for (const record of event.Records) {
    const product = JSON.parse(record.body) as Product;
    console.log("product: ", product);
    const transaction = createTransaction(product);
    if (transaction) {
      allTransactions.push(...transaction);
    }
  }
  await dbClient.send(
    new TransactWriteCommand({
      TransactItems: allTransactions,
    })
  );

  await snsClient.send(
    new PublishBatchCommand({
      TopicArn: process.env.TOPIC_ARN,
      PublishBatchRequestEntries: event.Records.map(({ body, messageId }) => {
        const product = JSON.parse(body) as Product;
        return {
          Id: messageId,
          Message: `Record has been added successfully:\n${JSON.stringify(
            product,
            null,
            4
          )}`,
          MessageAttributes: {
            count: {
              DataType: "Number",
              StringValue: product.count.toString(),
            },
            price: {
              DataType: "Number",
              StringValue: product.price.toString(),
            },
          },
        };
      }),
    })
  );

  console.log("sent to topic!");

  try {
  } catch (err) {
    console.error(err);
  }
};
