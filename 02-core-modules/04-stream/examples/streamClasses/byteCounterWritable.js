import { Writable } from "node:stream";

class ByteCounterWritable extends Writable {
  constructor() {
    super();
    this.totalBytes = 0;
  }
  _write(chunk, _, callback) {
    this.totalBytes += chunk.length;
    console.log(`Total bytes: ${this.totalBytes}`);
    callback();
  }
  _final(callback) {
    callback();
  }
}

process.stdin.pipe(new ByteCounterWritable());
