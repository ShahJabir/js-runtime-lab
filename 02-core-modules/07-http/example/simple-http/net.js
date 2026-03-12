import net from "net";

const socket = net.createConnection({ host: "127.0.0.2", port: 8230 }, () => {
  console.log("Connected to server");
  socket.write("Hello, from net client!");
});

socket.on("data", (chunk) => {
  console.log(chunk.toString("utf-8"));
});

socket.on("error", (err) => {
  console.error("Socket error:", err);
});

socket.on("end", () => {
  console.log("Connection ended");
});
