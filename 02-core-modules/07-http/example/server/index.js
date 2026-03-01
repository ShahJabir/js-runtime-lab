import http from "http";

const PORT = 8230;
const HOST = "127.0.0.2";

const server = http.createServer((_, res) => {
  const data = { message: "Hello from the HTTP server!" };
  res.writeHead(200, {
    "Content-Type": "application/json",
    Connection: "close",
  });
  res.end(JSON.stringify(data));
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
