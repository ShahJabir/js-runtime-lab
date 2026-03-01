import { open } from "node:fs/promises";
import { pipeline } from "stream";

(async () => {
  console.time("piping");
  const srcFile = await open("src.txt", "r");
  const destFile = await open("dest.txt", "w");

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  pipeline(readStream, writeStream, (err) => {
    if (err) {
      console.error("Pipeline failed:", err);
    } else {
      console.log("File copy completed.");
      console.timeEnd("piping");
    }
  });
})();
