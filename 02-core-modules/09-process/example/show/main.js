import fs from "fs";
import { stdout, stderr, stdin } from "process";
import { pipeline } from "stream/promises";
import { PassThrough } from "stream";

const files = process.argv.slice(2);

try {
  if (files.length === 0) {
    const sink = new PassThrough();
    sink.pipe(stdout);
    await pipeline(stdin, sink);
  } else {
    for (const file of files) {
      const sink = new PassThrough();
      sink.pipe(stdout);
      await pipeline(fs.createReadStream(file), sink);
    }
  }
} catch (err) {
  stderr.write(`show: ${err.message}\n`);
  process.exitCode = 1;
}
