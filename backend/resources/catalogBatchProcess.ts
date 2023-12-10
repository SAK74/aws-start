// import {
//   S3Client,
//   GetObjectCommand,
//   CopyObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
import { S3Event, SQSEvent } from "aws-lambda";
import {
  PublishBatchCommand,
  PublishCommand,
  SNSClient,
} from "@aws-sdk/client-sns";

// const REGION = process.env.REGION;
// const PARSE_DIR = process.env.PARSE_DIR;
const snsClient = new SNSClient();

export const handler = async (event: SQSEvent) => {
  console.log("SQS event: ", JSON.stringify(event.Records));

  for (const { body } of event.Records) {
    console.log("body: ", body);

    // to do add to DB !!!!!!!

    // await snsClient.send(
    //   new PublishCommand({
    //     TopicArn: process.env.TOPIC_ARN,
    //     Message: `Hi! Successfully add product: ${body}`,
    //   })
    // );

    // console.log("sent to topic!");
  }

  // to do add to DB !!!!!!!

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
