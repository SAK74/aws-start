import { Buffer } from "buffer";
import "dotenv/config";

const credentials = `SAK74:${process.env.SAK74}`;

const encodedCred = Buffer.from(credentials).toString("base64");
console.log(encodedCred);
// place this encoded token into localStorage with key "authorization_token" -> U0FLNzQ6VEVTVF9QQVNTV09SRA==
