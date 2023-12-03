// import { buildResp } from "./utils/buildResponse.mjs";
import {
  S3Client,
  PutObjectCommand,
  GetObjectAclCommand,
  GetObjectCommand,
  S3,
} from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Event } from "aws-lambda";
import csv from "csv-parser";
import * as fs from "fs";
import { Readable } from "stream";
// import {} from "console";
import { stdout } from "process";
import { IncomingMessage } from "http";
// import * as aws from '@aws-sdk/client-s3'

const REGION = process.env.REGION;
const BUCKET = process.env.BUCKET_NAME;
const UPLOAD_DIR = process.env.UPLOAD_DIR;
const PARSE_DIR = process.env.PARSE_DIR;

/**
 *
 * @param {S3Event} event
 */

export const handler = async (event: S3Event) => {
  console.log(JSON.stringify(event.Records));
  try {
    const {
      awsRegion,
      s3: {
        bucket: { name },
        object: { key },
      },
    } = event.Records[0];
    console.log("start");
    const sourceFile = await new S3Client().send(
      new GetObjectCommand({ Bucket: name, Key: key })
    );
    // const s3 = (await new aws.S3().getObject()).then(obj=>obj.ge)
    console.log("source: ", sourceFile);
    const body = await sourceFile.Body?.transformToString();
    console.log("body: ", body);

    if (body) {
      // fs.createReadStream(body).pipe(csv());
      // body.pipeTo(stdout)
      const results: string[] = [];
      Readable.from(body)
        .pipe(csv())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", async () => {
          console.log("Results: ", results);
        });

      // body.pipe(csv()).pipe(stdout);
    }
    //  event.Records.forEach(
    //   async ({
    //     awsRegion,
    //     s3: {
    //       bucket: { name },
    //       object: { key },
    //     },
    //   }) => {
    //     console.log("start");
    //     const sourceFile = await new S3Client().send(
    //       new GetObjectCommand({ Bucket: name, Key: key })
    //     );
    //     console.log("source: ", sourceFile);
    //     const body = sourceFile.Body;
    //     if (body instanceof Readable) {
    //       body.pipe(csv()).pipe(stdout);
    //     }
    //     console.log(body);
    //   }
    // );
  } catch (err) {
    console.error(err);
    // return buildResp(500, err.message || "Unknown server error...");
  }
};
