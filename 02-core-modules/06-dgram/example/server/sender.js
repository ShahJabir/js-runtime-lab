import dgram from "dgram";

const sender = dgram.createSocket("udp4");

sender.send("This is a test message", 3000, "127.0.0.1", (err, byt) => {
  err
    ? console.error(`Error sending message: ${err}`)
    : console.log(`Bytes: ${byt}`);
});
