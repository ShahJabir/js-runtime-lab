import { spawn, exec } from "node:child_process";

const echo = spawn("echo", ["Hello, World!"]);
const tr = spawn("tr", [" ", "\n"]);

echo.stdout.pipe(tr.stdin);

tr.stdout.on("data", (data) => {
  console.log(data.toString());
});

exec("ls src 2>&1 >/dev/null || true", (error, stdout, stderr) => {
  if (error) {
    console.error(error);
    return;
  }
  stderr ? console.error(stderr) : console.log(stdout);
});
