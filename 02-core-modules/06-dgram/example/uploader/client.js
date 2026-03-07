import dgram from "dgram";
import fs from "fs";
import path from "path";

const client = dgram.createSocket("udp4");

const HOST = "127.0.0.1";
const PORT = 8230;

const WINDOW_SIZE = 5;
const CHUNK_SIZE = 1024;

const filePath = process.argv[2];
const filename = path.basename(filePath);

let seq = 0;
let base = 0;
const packets = new Map();
const timers = new Map();

function createPacket(type, seq, payload = Buffer.alloc(0)) {
  const header = Buffer.alloc(5);
  header.writeUInt8(type, 0);
  header.writeUInt32BE(seq, 1);
  return Buffer.concat([header, payload]);
}

function sendPacket(packet, seq) {
  client.send(packet, PORT, HOST);

  const timer = setTimeout(() => {
    client.send(packet, PORT, HOST);
  }, 500);

  timers.set(seq, timer);
}

client.on("message", (msg) => {
  const type = msg.readUInt8(0);
  const ackSeq = msg.readUInt32BE(1);

  if (type === 4) {
    clearTimeout(timers.get(ackSeq));
    timers.delete(ackSeq);
    packets.delete(ackSeq);

    if (ackSeq === base) {
      while (!packets.has(base) && base < seq) {
        base++;
      }
    }
  }
});

async function sendFile() {
  const startPacket = createPacket(1, seq, Buffer.from(filename));
  packets.set(seq, startPacket);
  sendPacket(startPacket, seq);
  seq++;

  const stream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE });

  for await (const chunk of stream) {
    while (seq >= base + WINDOW_SIZE) {
      await new Promise((r) => setTimeout(r, 10));
    }

    const packet = createPacket(2, seq, chunk);
    packets.set(seq, packet);

    sendPacket(packet, seq);

    seq++;
  }

  const endPacket = createPacket(3, seq);
  packets.set(seq, endPacket);
  sendPacket(endPacket, seq);

  console.log("Upload finished");
}

sendFile();
