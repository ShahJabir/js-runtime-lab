import { stdin, stdout, stderr } from "process";

stdin.on("data", (data) => {
  stdout.write(`Got this data from standard in: ${data.toString("utf8")}\n`);
});
stdout.write("This is some output text that I want\n");
stderr.write("This is some error text that I may not want\n");
