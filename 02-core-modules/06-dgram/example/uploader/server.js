import dgram from "dgram";

const server = dgram.createSocket("udp4");

// server.on("message", (msg, rinfo) => {
//   console.log("Received message:", msg.toString());
//   console.log("From:", rinfo.address, "Port:", rinfo.port);
// });

server.on("message", (msg) => {
  if (Math.random() < 0.1) return; // drop 10%
  console.log(msg.toString());
});

server.on("listening", () => {
  const address = server.address();
  console.log("Server listening on", address.address, "Port:", address.port);
});

server.on("connect", (rinfo) => {
  console.log("Client connected:", rinfo.address, "Port:", rinfo.port);
});

server.bind(8230, "127.0.0.1");
