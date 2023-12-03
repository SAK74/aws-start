import { products } from "./data.mjs";
import { buildResp } from "./buildResponse.mjs";
import { RequiredMethodError } from "./utils/requiredMethodError.mjs";

/**
 *
 * @param {APIGatewayEvent} event
 */

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      throw new RequiredMethodError();
    }
    return buildResp(200, products);
  } catch (err) {
    let status = 500;
    if (err instanceof RequiredMethodError) {
      status = 400;
    }
    return buildResp(status, err.message || "Unknown server error");
  }
};
