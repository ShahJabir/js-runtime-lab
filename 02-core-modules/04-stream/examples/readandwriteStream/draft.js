import { open } from "node:fs/promises";

(async () => {
  console.time("copy");
  const srcFile = await open("src.txt", "r");
  const destFile = await open("dest.txt", "w");

  let bytesRead = -1;
  while (bytesRead !== 0) {
    const readResult = await srcFile.read();
    bytesRead = readResult.bytesRead;
    if (bytesRead !== 16384) {
      const indexOfNotFilled = readResult.buffer.indexOf(0);
      const newBuffer = Buffer.alloc(indexOfNotFilled);
      readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
      destFile.write(newBuffer);
    } else {
      destFile.write(readResult.buffer);
    }
  }
  console.timeEnd("copy");
  await srcFile.close();
  await destFile.close();
})();
