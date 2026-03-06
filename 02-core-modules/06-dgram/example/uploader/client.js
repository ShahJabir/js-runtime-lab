import dgram from "dgram";
import fs from "fs/promises";
import path from "path";

const client = dgram.createSocket("udp4");

const filePath = process.argv[2];
const fileName = path.basename(filePath);
client.send(
  JSON.stringify({ flag: "NAME", content: `filename: ${fileName}---` }),
  8230,
  "127.0.0.1",
);
const fileHandle = await fs.open(filePath, "r");
const fileReadStream = fileHandle.createReadStream();
fileReadStream.on("data", (chunk) => {
  client.send(
    Buffer.from(JSON.stringify({ flag: "DATA", content: chunk })),
    8230,
    "127.0.0.1",
  );
});

fileReadStream.on("end", () => {
  client.send(
    Buffer.from(JSON.stringify({ flag: "END", content: "EOF" })),
    8230,
    "127.0.0.1",
  );
});
