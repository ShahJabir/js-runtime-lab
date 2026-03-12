import http from "node:http";
import fs from "node:fs/promises";

const server = http.createServer();

server.on("request", async (req, res) => {
  if (req.url === "/" && req.method === "GET") {
    // Read the HTML file
    const htmlFile = await fs.open("./public/index.html", "r");
    const htmlStream = htmlFile.createReadStream();
    res.setHeader("Content-Type", "text/html");
    htmlStream.pipe(res);
    return;
  }
  if (req.url === "/style.css" && req.method === "GET") {
    // Read the CSS file
    const cssFile = await fs.open("./public/style.css", "r");
    const cssStream = cssFile.createReadStream();
    res.setHeader("Content-Type", "text/css");
    cssStream.pipe(res);
    return;
  }
  if (req.url === "/script.js" && req.method === "GET") {
    // Read the JavaScript file
    const jsFile = await fs.open("./public/script.js", "r");
    const jsStream = jsFile.createReadStream();
    res.setHeader("Content-Type", "text/javascript");
    jsStream.pipe(res);
    return;
  }
  if (req.url === "/api" && req.method === "POST") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    const body = {
      message: "Data received successfully",
      data: req.body,
    };
    res.end(JSON.stringify(body));
  }

  // Handle the request and response
  console.log("--- Methods ----");
  console.log(req.method);
  console.log("--- Headers ---");
  console.log(req.headers);
  console.log("--- URL ---");
  console.log(req.url);
  console.log("--- Body ---");
  console.log(req.body);
  req.on("data", (chunk) => {
    console.log(chunk.toString("utf-8"));
  });
  res.write("Hello, from server!");
  res.end();
});

server.listen(8230, "127.0.0.2", () => {
  console.log("Server is listening on port 8230");
});
