import * as http from "http";
import * as https from "https";
import { URL } from "url";

import cached from "./cacheData";

if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const ERROR_502 = "Cannot process request";

const PORT = process.env.PORT || 4001;

const server = http.createServer((req, resp) => {
  resp.setHeader("access-control-allow-origin", "*");
  // resp.setHeader(
  //   // ???
  //   "Access-Control-Allow-Headers",
  //   "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent"
  // );
  // resp.setHeader("Access-Control-Allow-Credentials", "true");
  // resp.setHeader("Access-Control-Allow-Methods", "OPTIONS,GET,PUT,DELETE");

  // resp.setHeader("Content-Type", "Application/json");

  try {
    const recipient = req.url?.split("/")[1].split("?")[0];
    const recipientUrl = process.env[recipient || ""];

    // console.log("recipient: ", recipient);
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
      // console.log("Products caching");
      resp.end(cached.cacheData);
    } else {
      let stream: NodeJS.WritableStream;

      const protocol = new URL(recipientUrl || "").protocol;
      // console.log("Recip protocol: ", protocol);
      const httpModule = protocol === "http:" ? http : https;

      // console.log("Req headers: ", req.headers);

      const { host, ...reqHeaders } = req.headers;

      const options: http.RequestOptions = {
        method: req.method,
        headers: reqHeaders,
      };

      // console.log("Path summary: ", recipientUrl + outgoingReqPath);
      const outgoingReq = httpModule.request(
        recipientUrl + outgoingReqPath,
        options,
        (outResp) => {
          const status = outResp.statusCode || 500;
          // console.log("Status: ", status, outResp.statusMessage);
          // console.log(
          //   "Out resp headers: ",
          //   recipient,
          //   req.method,
          //   outResp.headers
          // );
          resp.writeHead(status, outResp.headers);
          outResp.pipe(resp);

          if (recipient === "product" && req.method === "GET") {
            stream = cached.createStream();
            outResp.pipe(stream);
          }

          outResp.on("error", (err) => {
            // console.log("Response error: ", err.message);
            resp.write(err.message || http.STATUS_CODES[status]);
            resp.end();
          });
        }
      );

      req.pipe(outgoingReq);

      outgoingReq.on("error", (error) => {
        // console.log("Request Error: ", error.message);
        resp.statusCode = 400; //
        resp.statusMessage = http.STATUS_CODES[400] || "";
        resp.end(error.message);
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
