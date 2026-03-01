import { open } from "node:fs/promises";

(async () => {
  console.time("piping");
  const srcFile = await open("src.txt", "r");
  const destFile = await open("dest.txt", "w");

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  readStream.pipe(writeStream);

  readStream.on("error", (err) => {
    console.error("Error reading source file:", err);
    readStream.destroy();
    writeStream.end();
  });

  writeStream.on("error", (err) => {
    console.error("Error writing to destination file:", err);
    readStream.destroy();
    writeStream.end();
  });

  readStream.on("end", async () => {
    console.log("File copy completed.");
    console.timeEnd("piping");
    await srcFile.close();
    await destFile.close();
  });
})();
