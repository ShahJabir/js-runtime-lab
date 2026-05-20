import { performance } from "perf_hooks";
import { parentPort, workerData } from "worker_threads";
import { generatePrimes } from "./libs/prime-generator.js";

const start = performance.now();
const result = generatePrimes(workerData.count, workerData.start);
const end = performance.now();
const executionTime = `Execution time of generatePrimes${workerData.index + 1}: ${end - start} ms`;

parentPort?.postMessage({ result, executionTime });
