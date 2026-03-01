import { Transform } from "stream";

export class EncryptStream extends Transform {
  constructor(options) {
    super(options);
    this.bytesProcessed = 0;
  }

  _transform(chunk, _, callback) {
    const encrypted = Buffer.from(chunk);

    for (let i = 0; i < encrypted.length; i++) {
      if (encrypted[i] !== 255) {
        encrypted[i] = encrypted[i] + 1;
      }
    }

    this.bytesProcessed += encrypted.length;
    this.push(encrypted);
    callback();
  }

  _flush(callback) {
    console.log(`   Encrypted ${this.bytesProcessed.toLocaleString()} bytes`);
    callback();
  }
}
