import { APIGatewayProxyHandler } from "aws-lambda";
import { buildResp } from "./utils/buildResponse";

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("Event: ", event);
  try {
    return buildResp(200, event);
  } catch (err) {
    console.error(err);
    return buildResp(500, "server error");
  }
};
