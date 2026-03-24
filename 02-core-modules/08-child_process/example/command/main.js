import { spawn, exec } from "node:child_process";

const sub_process = spawn("ls", ["-la"]);

sub_process.stdout.on("data", (data) => {
  console.log(data.toString());
});

exec("ls src 2>&1 >/dev/null || true", (error, stdout, stderr) => {
  if (error) {
    console.error(error);
    return;
  }
  stderr ? console.error(stderr) : console.log(stdout);
  console.log("Hello, World! in last");
});
