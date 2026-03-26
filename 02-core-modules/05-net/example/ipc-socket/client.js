import net from "net";

const client = net.createConnection({ path: "/tmp/node_c_socket" });

client.on("connect", () => {
  console.log("Connected to the C server");
});

const b = Buffer.alloc(8);
b[0] = 0x12;
b[1] = 0x54;
b[2] = 0xfa;
client.end(b);

client.on("data", (data) => {
  console.log(`Recieved from C server: ${data.toString()}`);
});

client.on("end", () => {
  console.log("Connection closed by the server");
});

client.on("error", (err) => {
  console.log(`Error: ${err.message}`);
});
