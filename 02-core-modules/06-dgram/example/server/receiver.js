import dgram from "node:dgram";

const receiver = dgram.createSocket("udp4");

receiver.on("message", (msg, rinfo) => {
  console.log(`Received message: ${msg} from ${rinfo.address}:${rinfo.port}`);
  console.log(rinfo);
});

receiver.bind({ address: "127.0.0.1", port: 3000 });

receiver.on("listening", () => {
  console.log("Receiver is listening on");
  console.log(receiver.address());
});
