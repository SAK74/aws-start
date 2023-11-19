// // import * as cdk from "aws-cdk-lib";
// // import { Handler } from "aws-cdk-lib/aws-lambda";
// import { APIGatewayEvent } from "aws-lambda";
import { products } from "./data.mjs";
import { buildResp } from "./buildResponse.mjs";
import { GetRequiredError } from "./utils/getRequiredError.mjs";

/**
 *
 * @param {APIGatewayEvent} event
 */

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      throw new GetRequiredError();
    }
    return buildResp(200, products);
  } catch (err) {
    let status = 500;
    if (err instanceof GetRequiredError) {
      status = 400;
    }
    return buildResp(status, err.message);
  }
};
