import http from "node:http";

const agent = new http.Agent({ keepAlive: true });
const request = http.request({
  host: "127.0.0.2",
  port: 3000,
  path: "/",
  method: "POST",
  agent: agent,
  headers: { "content-type": "application/json" },
});

request.on("response", (res) => {
  console.log("--- Response ---");
  console.log(res.statusCode);
  console.log(res.headers);
  res.on("data", (chunk) => {
    console.log(chunk.toString("utf-8"));
  });
});

request.write(JSON.stringify({ message: "Hello, from agent client!" }));
request.end();
