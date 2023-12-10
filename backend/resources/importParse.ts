import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import csv from "csv-parser";
import { Readable } from "stream";
import { finished } from "node:stream/promises";
import {
  SQSClient,
  SendMessageBatchCommand,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";

const REGION = process.env.REGION;
const PARSE_DIR = process.env.PARSE_DIR;

const sqsClient = new SQSClient();

const maxBatchSize = 10;

const splitArray: <T>(arr: T[], size: number) => T[][] = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export const handler = async (event: S3Event) => {
  try {
    const {
      s3: {
        bucket: { name },
        object: { key },
      },
    } = event.Records[0];
    const client = new S3Client({ region: REGION });
    const sourceFile = await client.send(
      new GetObjectCommand({ Bucket: name, Key: key })
    );
    const body = sourceFile.Body;
    if (body) {
      const results: Record<string, any>[] = [];
      await finished(
        // Readable.from(body)
        (body as Readable).pipe(csv()).on("data", (data) => {
          console.log("in stream", data);
          results.push(data);
          // sqsClient.send(
          //   new SendMessageCommand({
          //     QueueUrl: process.env.QUEUE_URL,
          //     MessageBody: JSON.stringify(data),
          //   })
          // );
          // console.log("sent from stream");
        })
      );
      console.log("Result: ", results);

      // assurance max batch size
      const splitedArray = splitArray(results, maxBatchSize);

      for (const part of splitedArray) {
        await sqsClient.send(
          new SendMessageBatchCommand({
            QueueUrl: process.env.QUEUE_URL,
            Entries: part.map((el, i) => ({
              Id: i.toString(),
              MessageBody: JSON.stringify(el),
            })),
          })
        );
        console.log("Sent messages to queue!");
      }

      // await sqsClient.send(
      //   new SendMessageBatchCommand({
      //     QueueUrl: process.env.QUEUE_URL,
      //     Entries: results.map((el, i) => ({
      //       Id: i.toString(),
      //       MessageBody: JSON.stringify(el),
      //     })),
      //   })
      // );

      // console.log("Sent messages to queue!");

      // for (const item of results) {
      //   await sqsClient.send(
      //     new SendMessageCommand({
      //       QueueUrl: process.env.QUEUE_URL,
      //       MessageBody: JSON.stringify(item),
      //     })
      //   );
      //   console.log("Sent one message to queue!: ", item);
      // }

      await client.send(
        new CopyObjectCommand({
          CopySource: `${name}/${key}`,
          Bucket: name,
          Key: `${PARSE_DIR}/${key.split("/").slice(-1)}`,
        })
      );
      console.log("Object copied! ");

      await client.send(
        new DeleteObjectCommand({
          Bucket: name,
          Key: key,
        })
      );
      console.log("Object deleted! ");
    }
  } catch (err) {
    console.error(err);
  }
};
