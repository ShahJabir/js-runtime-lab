import dgram from "dgram";

const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
  const packet = JSON.parse(msg.toString("utf-8"));
  if (packet.flag === "DATA") {
    const buffer = Buffer.from(packet.content.data); // reconstruct buffer
    console.log(`Flag: ${packet.flag}, Content: ${buffer.toString("utf-8")}`);
  } else {
    console.log(`Flag: ${packet.flag}, Content: ${packet.content}`);
  }

  console.log("Client info:", rinfo);
});

server.on("listening", () => {
  const address = server.address();
  console.log("Server listening on", address.address, "Port:", address.port);
});

server.on("connect", (rinfo) => {
  console.log("Client connected:", rinfo.address, "Port:", rinfo.port);
});

server.bind(8230, "127.0.0.1");
