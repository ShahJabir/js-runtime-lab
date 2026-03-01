import { open } from "fs/promises";
import { CopyTransform } from "./copyTransform.js";

async function copyFile(srcPath, destPath) {
  console.time("copy");

  // open source and destination files
  const srcFile = await open(srcPath, "r");
  const destFile = await open(destPath, "w");

  const readStream = srcFile.createReadStream({ highWaterMark: 64 * 1024 });
  const writeStream = destFile.createWriteStream({ highWaterMark: 16 * 1024 });

  // create instance of CopyTransform
  const copyTransform = new CopyTransform(writeStream);

  return new Promise((resolve, reject) => {
    let errorOccurred = false;

    const endTimer = () => {
      try {
        console.timeEnd("copy");
      } catch {}
    };

    // pipe readable → transform
    readStream.pipe(copyTransform).on("finish", async () => {
      console.log(`Total Backpressure: ${copyTransform.backpressureCount}`);
      console.log(`Total Drain: ${copyTransform.drainCount}`);

      if (!errorOccurred) resolve();
      await srcFile.close();
      await destFile.close();
      endTimer();
    });

    const onError = async (err) => {
      if (errorOccurred) return;
      errorOccurred = true;

      readStream.destroy();
      writeStream.destroy();

      await srcFile.close().catch(() => {});
      await destFile.close().catch(() => {});
      endTimer();
      reject(err);
    };

    readStream.on("error", onError);
    writeStream.on("error", onError);
    copyTransform.on("error", onError);
  });
}

// USAGE
try {
  await copyFile("src.txt", "dest.txt");
  console.log("Copy Success");
} catch (err) {
  console.error("Copy Failed:", err);
}
