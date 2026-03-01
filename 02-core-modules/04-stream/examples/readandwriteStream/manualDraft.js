import { open } from "fs/promises";

async function copyFile(srcPath, destPath) {
  console.time("copy");
  const srcFile = await open(srcPath, "r");
  const destFile = await open(destPath, "w");

  const readStream = srcFile.createReadStream({ highWaterMark: 64 * 1024 });
  const writeStream = destFile.createWriteStream({ highWaterMark: 16 * 1024 });

  return new Promise((resolve, reject) => {
    let errorOccurred = false;
    let isPaused = false;
    let backpressureCount = 0;
    let drainCount = 0;
    const endTimer = () => {
      try {
        console.timeEnd("copy");
      } catch {}
    };

    // Handle backpressure
    readStream.on("data", (chunk) => {
      if (!writeStream.write(chunk)) {
        readStream.pause();
        isPaused = true;
        backpressureCount++;
      }
    });

    // Resume when buffer drains
    writeStream.on("drain", () => {
      if (isPaused) {
        readStream.resume();
        isPaused = false;
        drainCount++;
      }
    });

    // Handle completion
    readStream.on("end", () => {
      console.log(`Total Backpressure: ${backpressureCount}`);
      console.log(`Total Drain: ${drainCount}`);
      writeStream.end();
    });
    writeStream.on("finish", async () => {
      if (!errorOccurred) resolve();
      await srcFile.close();
      await destFile.close();
      endTimer();
    });

    // error handling
    readStream.on("error", (error) => {
      if (errorOccurred) return;
      errorOccurred = true;
      writeStream.destroy();
      readStream.destroy();
      endTimer();
      reject(error);
    });
    writeStream.on("error", (error) => {
      if (errorOccurred) return;
      errorOccurred = true;
      writeStream.destroy();
      readStream.destroy();
      endTimer();
      reject(error);
    });
  });
}

try {
  await copyFile("src.txt", "dest.txt");
  console.log("Copy Success");
} catch (error) {
  console.error(error);
}
