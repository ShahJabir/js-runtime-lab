import { Readable, pipeline } from "node:stream";
class NumberReadable extends Readable {
  constructor(max) {
    super();
    this.current = 1;
    this.max = max;
  }
  _read() {
    if (this.current > this.max) {
      this.push(null);
    } else {
      this.push(Buffer.from(String(this.current++) + "\n"));
    }
  }
}

pipeline(new NumberReadable(5), process.stdout, (err) => {
  if (err) {
    console.error(`Error: ${err}`);
  } else {
    return;
  }
});
