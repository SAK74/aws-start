import http, { RequestOptions } from "http";
import https from "https";

import cached from "./cacheData";

if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const ERROR_502 = "Cannot process request";

const PORT = process.env.PORT || 4001;

const server = http.createServer((req, resp) => {
  resp.setHeader("access-control-allow-origin", "*");
  resp.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent"
  );
  resp.setHeader("Access-Control-Allow-Credentials", "true");
  resp.setHeader("Access-Control-Allow-Methods", "OPTIONS,GET,PUT");

  try {
    const recipient = req.url?.split("/")[1].split("?")[0];
    const recipientUrl = process.env[recipient || ""];
    // console.log("recipient url: ", recipientUrl);
    const outgoingReqPath = req.url?.replace(`/${recipient}`, "");

    if (!recipientUrl) {
      resp.statusCode = 502;
      resp.statusMessage = ERROR_502;
      resp.end(JSON.stringify({ message: ERROR_502 }));
    } else if (
      recipient === "product" &&
      req.method === "GET" &&
      !outgoingReqPath &&
      cached.cacheData
    ) {
      resp.statusCode = 200;
      resp.end(cached.cacheData);
    } else {
      let stream: NodeJS.WritableStream;

      const httpModule = recipient === "cart" ? http : https;

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const options: RequestOptions = {
          method: req.method,
          headers: {},
        };
        if (req.headers["authorization"]) {
          options.headers!.authorization = req.headers.authorization;
        }
        // console.log("Path summary: ", recipientUrl + outgoingReqPath);
        const outgoingReq = httpModule.request(
          recipientUrl + outgoingReqPath,
          options,
          (outResp) => {
            const status = outResp.statusCode || 500;
            // console.log("Status: ", status, outResp.statusMessage);
            resp.statusCode = status;

            outResp.on("data", (data) => {
              // console.log("Data: ", data.toString());
              if (recipient === "product" && req.method === "GET") {
                stream = cached.createStream();
                stream.write(data);
              }

              resp.write(data);
            });
            outResp.on("error", (err) => {
              // console.log("Error: ", err.message);
              resp.write(err.message || http.STATUS_CODES[status]);
              resp.end();
            });
            outResp.on("end", () => {
              if (recipient === "product" && req.method === "GET") {
                stream.end();
              }
              resp.end();
            });
          }
        );
        if (body) {
          outgoingReq.write(body);
        }

        outgoingReq.on("error", (error) => {
          // console.log("Error: ", error.message);
          resp.statusCode = 400; //
          resp.statusMessage = http.STATUS_CODES[400] || "";
          resp.end(error.message);
        });
        outgoingReq.end();
      });
    }
  } catch (err) {
    // console.log(err);
    resp.statusCode = 500;
    resp.end((err as Error).message);
  }
});

server.listen(PORT, () => {
  console.log(`Server started in ${PORT} port.`);
});
