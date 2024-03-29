// import { OutgoingHttpHeaders } from "http";

export const buildResp = (
  status: number,
  body: any,
  headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "*",
  }
) => ({
  statusCode: status,
  headers,
  body: JSON.stringify(body),
});
