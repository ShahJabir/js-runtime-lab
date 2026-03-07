import dgram from "dgram";
import fs from "fs";

const PORT = 8230;
const server = dgram.createSocket("udp4");

let fileStream = null;
let expectedSeq = 0;
const buffer = new Map();

function sendAck(seq, rinfo) {
  const buf = Buffer.alloc(5);
  buf.writeUInt8(4, 0);
  buf.writeUInt32BE(seq, 1);
  server.send(buf, rinfo.port, rinfo.address);
}

function processPacket(seq, payload) {
  fileStream.write(payload);
}

server.on("message", (msg, rinfo) => {
  const type = msg.readUInt8(0);
  const seq = msg.readUInt32BE(1);
  const payload = msg.slice(5);

  if (type === 1) {
    const filename = payload.toString();
    console.log("Starting file:", filename);

    fileStream = fs.createWriteStream(`upload_${filename}`);
    expectedSeq = 1;

    sendAck(seq, rinfo);
    return;
  }

  if (type === 2) {
    if (seq === expectedSeq) {
      processPacket(seq, payload);
      expectedSeq++;

      while (buffer.has(expectedSeq)) {
        processPacket(expectedSeq, buffer.get(expectedSeq));
        buffer.delete(expectedSeq);
        expectedSeq++;
      }
    } else if (seq > expectedSeq) {
      buffer.set(seq, payload);
    }

    sendAck(seq, rinfo);
    return;
  }

  if (type === 3) {
    console.log("File upload finished");
    fileStream.end();
    sendAck(seq, rinfo);
  }
});

server.bind(PORT, "127.0.0.1", () => {
  console.log(`UDP server listening on ${PORT}`);
});
