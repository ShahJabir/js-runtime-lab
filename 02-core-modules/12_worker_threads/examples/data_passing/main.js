import { Worker } from "worker_threads";

const obj = { name: "John", age: 30 };

new Worker(new URL("./worker.js", import.meta.url), { workerData: obj });

console.log("Object from main thread:", obj);
