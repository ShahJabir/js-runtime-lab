import http from "node:http";
import fs from "node:fs/promises";
import { pipeline } from "node:stream/promises";

class Backlia {
  constructor() {
    this.routes = {};
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  async handleRequest(req, res) {
    /* 1. Decorate response FIRST */
    res.sendFile = async (filePath, mime) => {
      let fileHandle;
      try {
        res.setHeader("Content-Type", mime);
        fileHandle = await fs.open(filePath, "r");
        await pipeline(fileHandle.createReadStream(), res);
      } catch (err) {
        res.statusCode = 500;
        res.end("Failed to send file");
      } finally {
        await fileHandle?.close();
      }
    };

    /* 2. Route resolution */
    const key = req.method.toLowerCase() + req.url;
    const route = this.routes[key];

    if (!route) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }

    /* 3. Execute route */
    await route(req, res);
  }

  route(method, url, handler) {
    this.routes[method.toLowerCase() + url] = handler;
  }

  listen(host, port, callback) {
    this.server.listen(port, host, callback);
  }
}

export default Backlia;
