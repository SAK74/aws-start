import { Writable } from "stream";

class CacheData {
  cacheData: string;
  constructor() {
    this.cacheData = "";
  }

  createStream(): Writable {
    const stream = new Writable({
      write: (
        chunk: string,
        encoding: BufferEncoding,
        callback: (error?: Error | null) => void
      ) => {
        // console.log("Started!");
        this.cacheData += chunk;
        callback();
      },
    });

    stream.on("finish", () => {
      // console.log("Cached!");
      setTimeout(() => {
        this.cacheData = "";
        // console.log("Cleared...!");
      }, 1000 * 120);
    });

    return stream;
  }
}

export default new CacheData();
