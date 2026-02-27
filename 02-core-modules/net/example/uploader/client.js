import net from "net";
import fs from "fs/promises";

const socket = net.createConnection({ port: 5050, host: "::1" }, async () => {
  const filePath = "text.txt";
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
