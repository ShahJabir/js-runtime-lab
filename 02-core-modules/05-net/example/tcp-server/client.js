import net from "net";

const socket = net.createConnection({ host: "127.0.0.2", port: 8230 }, () => {
  socket.write(Buffer.from("Hello, World!"));
  socket.on("error", (err) => {
    console.error(err);
  });
});
