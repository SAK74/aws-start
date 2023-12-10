// import {
//   S3Client,
//   GetObjectCommand,
//   CopyObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
import { S3Event, SQSEvent } from "aws-lambda";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

// const REGION = process.env.REGION;
// const PARSE_DIR = process.env.PARSE_DIR;
const snsClient = new SNSClient();

export const handler = async (event: SQSEvent) => {
  console.log("SQS event: ", JSON.stringify(event.Records));
  for (const { body } of event.Records) {
    console.log("body: ", body);

    // to do add to DB

    await snsClient.send(
      new PublishCommand({
        TopicArn: process.env.TOPIC_ARN,
        Message: `Hi! Successfully add product: ${body}`,
      })
    );
    console.log("sent to topic!");
  }

  try {
  } catch (err) {
    console.error(err);
  }
};
