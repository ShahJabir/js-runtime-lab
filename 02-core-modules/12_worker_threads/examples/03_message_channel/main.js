import { Worker, MessageChannel, workerData } from "worker_threads";

const channel = new MessageChannel();

const { port1, port2 } = channel;

port1.postMessage("Hello from main thread!");

const worker = new Worker(new URL("./worker.js", import.meta.url), {
  workerData: { port: port2 },
  transferList: [port2],
});
