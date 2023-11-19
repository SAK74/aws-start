// // import * as cdk from "aws-cdk-lib";
// // import { Handler } from "aws-cdk-lib/aws-lambda";
// import { APIGatewayEvent  } from "aws-lambda";
import { products } from "./data.mjs";

// /**
//  *
//  * @param {APIGatewayEvent} event
//  */

export const handler = async (event) => {
  // console.log(event);

  const body = JSON.stringify({
    request: event,
    products,
  });
  return {
    statusCode: 200,
    body,
  };
};
