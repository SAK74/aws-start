import { buildResp } from "./utils/buildResponse";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayEvent, Handler } from "aws-lambda";

const REGION = process.env.REGION;
const BUCKET = process.env.BUCKET_NAME;
const DIR = process.env.UPLOAD_DIR;

export const handler: Handler<APIGatewayEvent> = async (event) => {
  try {
    const name = event.queryStringParameters?.name;
    if (!name) {
      throw new Error("Name parameter not defined..");
    }

    const client = new S3Client({ region: REGION });
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${DIR}/${name}`,
    });

    return buildResp(
      200,
      await getSignedUrl(client, command, { expiresIn: 300 })
    );
  } catch (err) {
    return buildResp(500, (err as Error).message || "Unknown server error...");
  }
};
