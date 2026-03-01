import { open as openPromise } from "fs/promises";
import { open, write, writeSync, createWriteStream } from "fs";

// File writing using promises
(async () => {
  console.time("writeManyPromise");
  const fileHandle = await openPromise("testPromise.txt", "w");
  for (let index = 0; index < 1000000; index++) {
    await fileHandle.write(` ${index} `);
  }
  console.timeEnd("writeManyPromise");
})();

// Write file using sync
(async () => {
  console.time("writeManySync");
  open("testSync.txt", "w", (_, fd) => {
    for (let index = 0; index < 1000000; index++) {
      writeSync(fd, ` ${index} `);
    }
  });
  console.timeEnd("writeManySync");
})();

// Write file using CallBack
(async () => {
  console.time("writeManyCallBack");
  open("testCallBack.txt", "w", (_, fd) => {
    for (let index = 0; index < 1000000; index++) {
      write(fd, ` ${index} `, () => {});
    }
  });
  console.timeEnd("writeManyCallBack");
})();

// Write file using stream
(async () => {
  console.time("writeManyStream");

  const stream = createWriteStream("testStream.txt");

  for (let index = 0; index < 1000000; index++) {
    const buff = Buffer.from(` ${index} `, "utf-8");

    if (!stream.write(buff)) {
      await new Promise((resolve) => stream.once("drain", resolve));
    }
  }

  stream.end();

  await new Promise((resolve) => stream.once("finish", resolve));

  console.timeEnd("writeManyStream");
})();
