import { pie } from "./libs/pie.js";
import { performance } from "perf_hooks";
import { parentPort } from "worker_threads";
import { isPrimeBigInt } from "./libs/prime-generator.js";

const start = performance.now();
const result = isPrimeBigInt(pie());
const end = performance.now();
const executionTime = `Execution time of isPrimeBigInt: ${end - start} ms`;

parentPort?.postMessage({ result, executionTime });
