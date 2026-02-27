import net from "net";
import fs from "fs/promises";
import path from "path";

const socket = net.createConnection({ port: 5050, host: "::1" }, async () => {
  const filePath = process.argv[2];
  const fileName = path.basename(filePath);
  socket.write(`filename: ${fileName}---`);
  const fileHandle = await fs.open(filePath, "r");
  const fileReadStream = fileHandle.createReadStream();
  fileReadStream.on("data", (chunk) => {
    if (!socket.write(chunk)) {
      fileReadStream.pause();
    }
  });
  socket.on("drain", () => {
    fileReadStream.resume();
  });
  fileReadStream.on("end", () => {
    socket.end();
  });
});
