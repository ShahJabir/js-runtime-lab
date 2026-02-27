import net from "net";
import fs from "fs/promises";

const server = net.createServer();
let fileHandle, fileWriteStream;
server.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("data", async (data) => {
    if (!fileHandle) {
      socket.pause();
      fileHandle = await fs.open("storage/test.txt", "w");
      fileWriteStream = fileHandle.createWriteStream();
      fileWriteStream.write(data);
      socket.resume();
      fileWriteStream.on("drain", () => {
        socket.resume();
      });
    } else if (!fileWriteStream.write(data)) {
      socket.pause();
    }
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
