import dgram from "dgram";

const client = dgram.createSocket("udp4");

for (let i = 1; i <= 1000; i++) {
  setTimeout(() => {
    client.send(i.toString(), 8230, "127.0.0.1");
  }, Math.random() * 10);
}
