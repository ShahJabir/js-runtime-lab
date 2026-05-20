import { performance } from "perf_hooks";
import { parentPort, workerData } from "worker_threads";
import { generatePrimes } from "./libs/prime-generator.js";

const start = performance.now();
console.log(generatePrimes(workerData.count, workerData.start));
const end = performance.now();
console.log(
  `Execution time of generatePrimes${workerData.index + 1}: ${end - start} ms`,
);
