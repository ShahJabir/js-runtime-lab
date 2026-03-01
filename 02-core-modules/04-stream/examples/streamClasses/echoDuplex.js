import { Duplex } from "node:stream";

class EchoDuplex extends Duplex {
  _write(chunk, _, callback) {
    console.log(`Received: ${chunk.toString().trim()}`);
    callback();
  }
  _read() {
    this.push("Echo from duplex \n");
    this.push(null);
  }
}

const duplex = new EchoDuplex();
duplex.pipe(process.stdout);
duplex.write("Hello Duplex\n");
