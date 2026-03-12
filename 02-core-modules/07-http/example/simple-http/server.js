import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const server = http.createServer();
const UPLOAD_DIR = "./public/uploads";
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

server.on("request", async (req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.setHeader("Content-Type", "text/html");
    await pipeline(
      (await fs.open("./public/index.html")).createReadStream(),
      res,
    );
    return;
  }

  if (req.url === "/style.css" && req.method === "GET") {
    res.setHeader("Content-Type", "text/css");
    await pipeline(
      (await fs.open("./public/style.css")).createReadStream(),
      res,
    );
    return;
  }

  if (req.url === "/script.js" && req.method === "GET") {
    res.setHeader("Content-Type", "text/javascript");
    pipeline((await fs.open("./public/script.js")).createReadStream(), res);
    return;
  }

  if (req.url === "/api" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "OK", received: body }));
    return;
  }

  if (req.url === "/upload" && req.method === "PUT") {
    /* 1. Validate filename */
    const rawFilename = req.headers["x-filename"];
    if (!rawFilename) {
      res.statusCode = 400;
      res.end("Missing X-Filename header");
      return;
    }

    const filename = path.basename(rawFilename);
    const filepath = path.join(UPLOAD_DIR, filename);

    /* 2. Validate content length */
    const length = Number(req.headers["content-length"]);
    if (!length || length > MAX_SIZE) {
      res.statusCode = 413;
      res.end("File too large or missing Content-Length");
      return;
    }

    /* 3. Validate content type (optional but recommended) */
    const type = req.headers["content-type"];
    if (!type || !type.startsWith("image/")) {
      res.statusCode = 415;
      res.end("Unsupported Media Type");
      return;
    }

    /* 4. Open file */
    let fileHandle;
    try {
      fileHandle = await fs.open(filepath, "w");

      /* 5. Stream upload */
      await pipeline(req, fileHandle.createWriteStream());

      /* 6. Success */
      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message: "Upload successful",
          filename,
          size: length,
          type,
        }),
      );
    } catch (err) {
      res.statusCode = 500;
      res.end("Upload failed");
    } finally {
      if (fileHandle) {
        await fileHandle.close().catch(() => {});
      }
    }

    return;
  }

  res.statusCode = 404;
  res.end("Not Found");
});

server.listen(8230, "127.0.0.2", () => {
  console.log("Server is listening on port 8230");
});
