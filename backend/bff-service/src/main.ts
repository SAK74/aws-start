import http from "http";
import https from "https";

if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const ERROR_502 = "Cannot process request";

const PORT = process.env.PORT || 4001;
// console.log("test: ", process.env);

const server = http.createServer((req, resp) => {
  resp.setHeader("access-control-allow-origin", "*");

  console.log("Req url: ", req.url);

  const recipient = req.url?.split("/")[1].split("?")[0];
  console.log("recipient: ", recipient);
  const recipientUrl = process.env[recipient || ""];
  console.log("recipient url: ", recipientUrl);

  if (!recipientUrl) {
    //to change
    resp.statusCode = 502;
    resp.statusMessage = ERROR_502;
    resp.end(JSON.stringify({ message: ERROR_502 }));
  } else {
    // const useHttps = false;

    const outgoingReqPath = req.url?.replace(`/${recipient}`, "");
    console.log("out url: ", outgoingReqPath);

    const httpModule = recipient === "cart" ? http : https;

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      // console.log("End of request! Body: ", body, typeof body);
      console.log("Path summary: ", recipientUrl + outgoingReqPath);
      const outgoingReq = httpModule.request(
        // "https://randomuser.me/api/",
        // "http://localhost:3002",
        // "https://uj2cycpqbe.execute-api.eu-north-1.amazonaws.com/dev" +
        //   "/products",
        recipientUrl + outgoingReqPath,
        {
          method: req.method,
          // path: req.url,
          headers: {
            // "Content-ty"
            // connection: "keep-alive",
            // "Content-Type": ["application/json"],
            authorization: req.headers.authorization,
          },
          // auth: req.headers.authorization,
        },
        (outResp) => {
          const status = outResp.statusCode || 500;
          console.log("Status: ", status);
          resp.statusCode = status;
          outResp.on("data", (data) => {
            console.log("Data: ", data.toString());
            resp.write(data);
          });
          outResp.on("error", (err) => {
            console.log("Error: ", err.message);
            // resp.statusCode = status;
            resp.write(err.message || http.STATUS_CODES[status]);
            resp.end();
          });
          outResp.on("end", () => {
            // resp.statusCode = status;
            resp.end();
          });
        }
      );
      // console.log(outgoingReq);
      if (body) {
        console.log("Body: ", body);
        outgoingReq.write(body);
        // console.log("Headers: ", req.headers);
      }
      // console.log(req.url);
      console.log("outgoing URL: ", outgoingReq.path);
      outgoingReq.on("error", (error) => {
        console.log("Error: ", error);
      });
      outgoingReq.end();
    });
    // resp.writeHead(200, {
    //   "access-control-allow-origin": "*",
    // });

    // resp.statusCode = 200;
    // resp.end("Hello!");
  }
});

server.listen(PORT, () => {
  console.log(`Server started in ${PORT} port.`);
});
