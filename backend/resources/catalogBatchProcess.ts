import { SQSEvent } from "aws-lambda";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
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
    new PublishCommand({
      TopicArn: process.env.TOPIC_ARN,
      Message: `Hi! Successfully add follow products:\n ${JSON.stringify(
        event.Records.map((record) => JSON.parse(record.body)),
        null,
        4
      )}`,
    })
  );
  // await snsClient.send(
  //   new PublishBatchCommand({
  //     TopicArn: process.env.TOPIC_ARN,
  //     PublishBatchRequestEntries: event.Records.map(
  //       ({ body, messageId }, i) => ({
  //         Id: messageId,
  //         Message: body,
  //       })
  //     ),
  //   })
  // );
  console.log("sent to topic!");

  try {
  } catch (err) {
    console.error(err);
  }
};
