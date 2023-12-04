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

const REGION = process.env.REGION;
const PARSE_DIR = process.env.PARSE_DIR;

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
    const body = await sourceFile.Body?.transformToString();
    if (body) {
      const results: string[] = [];
      await finished(
        Readable.from(body)
          .pipe(csv())
          .on("data", (data) => {
            results.push(data);
          })
      );
      console.log("Result: ", results);

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
