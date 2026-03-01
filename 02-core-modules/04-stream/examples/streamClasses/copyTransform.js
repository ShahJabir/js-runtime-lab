import { Transform } from "stream";

export class CopyTransform extends Transform {
  constructor(writeStream) {
    super();
    this.writeStream = writeStream;
    this.isPaused = false;
    this.backpressureCount = 0;
    this.drainCount = 0;

    this.writeStream.on("drain", () => {
      if (this.isPaused) {
        this.resume();
        this.isPaused = false;
        this.drainCount++;
      }
    });
  }
  _transform(chunk, _, callback) {
    if (!this.writeStream.write(chunk)) {
      this.pause();
      this.isPaused = true;
      this.backpressureCount++;
    }
    callback();
  }
  _flush(callback) {
    this.writeStream.end();
    callback();
  }
}
