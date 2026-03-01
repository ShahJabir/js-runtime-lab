import net from "net";

const PORT = 8230;
const HOST = "127.0.0.2";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log(data);
  });
  socket.on("error", (err) => {
    console.error(err);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`TCP server listening on http://${HOST}:${PORT}`);
  console.log(server.address());
});
