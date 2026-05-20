import { workerData } from "worker_threads";

const obj = workerData;

obj.name = "Jane";

console.log("Object from worker thread:", obj);
