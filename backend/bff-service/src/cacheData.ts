import { Writable } from "stream";

class CacheData {
  cacheData: string;
  constructor() {
    this.cacheData = "";
  }

  createStream(): NodeJS.WritableStream {
    const stream = new Writable({
      write: function (
        chunk: string,
        encoding: BufferEncoding,
        callback: (error?: Error | null) => void
      ) {
        // console.log("Started!");
        (this as CacheData).cacheData += chunk;
        callback();
      }.bind(this),
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
