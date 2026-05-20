import { Worker } from "node:worker_threads";

const THREADS = 10;
const count = 200;

for (let i = 0; i < THREADS; i++) {
  const data = {
    count: count / THREADS,
    start: 100_000_000_000_000 + i * 300,
    index: i,
  };

  const worker = new Worker(new URL("./worker_generate.js", import.meta.url), {
    workerData: data,
  });
}

const worker_bigInt = new Worker(
  new URL("./worker_bigint.js", import.meta.url),
  {
    workerData: {},
  },
);

worker_bigInt.on("message", (result) => {
  console.log(result);
});

worker_bigInt.on("error", (error) => {
  console.error(error);
});

worker_bigInt.on("exit", (code) => {
  console.log(`Worker exited with code ${code}`);
});
