import http from "node:http";
import fs from "node:fs/promises";

const server = http.createServer();

server.on("request", async (req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.setHeader("Content-Type", "text/html");
    (await fs.open("./public/index.html")).createReadStream().pipe(res);
    return;
  }

  if (req.url === "/style.css" && req.method === "GET") {
    res.setHeader("Content-Type", "text/css");
    (await fs.open("./public/style.css")).createReadStream().pipe(res);
    return;
  }

  if (req.url === "/script.js" && req.method === "GET") {
    res.setHeader("Content-Type", "text/javascript");
    (await fs.open("./public/script.js")).createReadStream().pipe(res);
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

  res.statusCode = 404;
  res.end("Not Found");
});

server.listen(8230, "127.0.0.2", () => {
  console.log("Server is listening on port 8230");
});
