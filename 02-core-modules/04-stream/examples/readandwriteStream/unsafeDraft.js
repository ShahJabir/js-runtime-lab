import { open } from "node:fs/promises";

(async () => {
  const fileHandleRead = await open("src.txt", "r");
  const fileHandleWrite = await open("dest.txt", "w");

  const streamRead = fileHandleRead.createReadStream({
    highWaterMark: 64 * 1024, // 64 kb
  });
  const streamWrite = fileHandleWrite.createWriteStream();

  streamRead.on("data", (chunk) => {
    console.log(streamRead);
    streamWrite.write(chunk);
  });
})();
