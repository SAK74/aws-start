import { buildResp } from "./buildResponse.mjs";
import { products } from "./data.mjs";
// import { APIGatewayEvent } from "aws-lambda";

/**
 *
 * @param {APIGatewayEvent} event
 */

export const handler = async (event) => {
  const { id } = event.pathParameters;
  try {
    if (event.httpMethod !== "GET") {
      throw new GetRequiredError();
    }
    const product = products.find((product) => product.id === id);
    if (!id || !product) {
      const err = new Error("Product not found (wrong or missed ID)!");
      err.name = "wrongId";
      throw err;
    }
    return buildResp(200, product);
  } catch (err) {
    let status = 500;
    if (err.name === "wrongId") {
      status = 404;
    }
    return buildResp(status, err.message);
  }
};
