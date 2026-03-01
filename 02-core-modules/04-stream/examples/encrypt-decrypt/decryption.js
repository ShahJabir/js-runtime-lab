import { Transform } from "node:stream";

export class DecryptStream extends Transform {
  constructor(options) {
    super(options);
    this.bytesProcessed = 0;
  }

  _transform(chunk, _, callback) {
    const decrypted = Buffer.from(chunk);

    for (let i = 0; i < decrypted.length; i++) {
      if (decrypted[i] !== 0) {
        decrypted[i] = decrypted[i] - 1;
      }
    }

    this.bytesProcessed += decrypted.length;
    this.push(decrypted);
    callback();
  }

  _flush(callback) {
    console.log(`   Decrypted ${this.bytesProcessed.toLocaleString()} bytes`);
    callback();
  }
}
