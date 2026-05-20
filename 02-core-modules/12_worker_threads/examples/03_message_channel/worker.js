import { workerData } from "node:worker_threads";

const port = workerData.port;

port.on("message", (message) => {
  console.log("Received message from main thread:", message);
});
