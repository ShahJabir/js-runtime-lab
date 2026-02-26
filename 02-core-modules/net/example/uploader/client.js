import net from "net";
import fs from "fs/promises";

const socket = net.createConnection({ port: 5050, host: "::1" }, async () => {
  const filePath = "text.txt";
  const fileHandle = await fs.open(filePath, "r");
  const fileStream = fileHandle.createReadStream();
  fileStream.on("data", (chunk) => {
    socket.write(chunk);
  });
  fileStream.on("end", () => {
    socket.end();
  });
});
