import { products } from "./data.mjs";
// import { APIGatewayEvent } from "aws-lambda";

// /**
//  *
//  * @param {APIGatewayEvent} event
//  */

export const handler = async (event) => {
  const { id } = event.pathParameters;

  const body = JSON.stringify({
    params: id,
    product: products.find((product) => product.id === id),
  });
  return {
    statusCode: 200,
    body,
  };
};
