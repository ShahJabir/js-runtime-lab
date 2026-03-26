import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";

const numberFormatter = spawn("./number_formatter", ["./dest.txt", "$", ","]);

numberFormatter.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

numberFormatter.stderr.on("data", (data) => {
  console.log(`stderr: ${data}`);
});

numberFormatter.on("close", (code) => {
  if (code === 0) {
    console.log("The file was read, processed and written successfully!");
  } else {
    console.log("Something bad happened!");
  }
});

// /Users/joseph/Desktop/text-gigantic.txt
const fileStream = createReadStream("/Users/joseph/Desktop/text-gigantic.txt");
fileStream.pipe(numberFormatter.stdin);

// numberFormatter.stdin.write("324 8236 4238");
// numberFormatter.stdin.write("3123 24 8236 4238");
// numberFormatter.stdin.write("324 12 38236 4238");
// numberFormatter.stdin.end("321 234 8236 4231 23128"); // sending EOF sign
