import net from "net";
import fs from "fs/promises";

const server = net.createServer();
let fileHandle, fileStream;
server.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("data", async (data) => {
    fileHandle = await fs.open("storage/test.txt", "w");
    fileStream = fileHandle.createWriteStream();
    console.log(data);
    fileStream.write(data);
  });
  socket.on("end", async () => {
    console.log("Connection ended");
    if (fileHandle) {
      await fileHandle.close();
    }
  });
});

server.listen(5050, "::1", () => {
  console.log("Uploader Server listening on ", server.address());
});
