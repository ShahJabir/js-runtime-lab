import { Worker, isMainThread } from "node:worker_threads";

if (isMainThread) {
  setTimeout(() => {
    for (let index = 0; index < 16; index++) {
      console.log(`Running threads no ${index}`);
      new Worker(new URL("./tasks.js", import.meta.url));
    }
  }, 0);
} else {
  console.log("Inside Worker!");
  console.log(`isMainThread: ${isMainThread}`); // Prints 'false'.
}
