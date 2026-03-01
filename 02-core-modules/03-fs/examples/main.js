import { readFileSync, readFile } from "node:fs";

const file = readFileSync("./text.txt");
console.log(file);
console.log(file.toString("hex"));

readFile("./hello.txt", (err, data) => {
  err ? console.log(`Error: ${err.message}`) : console.log(`success: ${data}`);
});
