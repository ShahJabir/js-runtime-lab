import { spawn } from "node:child_process";

console.log(`Mode in NodeJS: ${process.env.MODE}`);

const execute = spawn(
  "./main",
  ["Hello", "World", "My", "Name", "Is", "John"],
  { env: { MODE: "development" } },
);

execute.stdout.on("data", (data) => {
  console.log(data.toString());
});

console.log(`NodeJS Process ID: ${process.pid}`);
console.log(`NodeJS Parent Process ID: ${process.ppid}`);
