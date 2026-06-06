import { workerData, parentPort } from "worker_threads";
import { deflate } from "zlib";
import { readFileSync } from "fs";

// Compress a binary data
function compress(data) {
  return new Promise((resolve, reject) => {
    deflate(data, (err, buffer) => {
      if (err) {
        console.error("An error occurred:", err);
        reject(err);
      }
      resolve("done");
    });
  });
}

(async () => {
  const data = readFileSync("./text.txt"); // data to compress many times
  const totalIterations = workerData.count; // total number of times to compress
  const batchSize = 1000; // number of promises to resolve in each batch

  let remainingIterations = totalIterations;

  while (remainingIterations > 0) {
    const iterationsToProcess = Math.min(batchSize, remainingIterations);
    let promises = [];

    // Generate promises for this batch
    for (let i = 0; i < iterationsToProcess; i++) {
      promises.push(
        compress(data)
          .then((result) => {})
          .catch((err) => {
            console.error("Error compressing:", err);
          }),
      );
    }

    // Wait for all promises in the batch to settle
    await Promise.all(promises);

    // Decrease remaining iterations
    remainingIterations -= iterationsToProcess;
  }

  parentPort.postMessage("done");
})();
