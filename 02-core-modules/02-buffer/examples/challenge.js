// 0100 1000 0110 1001 0010 0001
import { Buffer } from "buffer";

// const memoryContainer = Buffer.from([0x48, 0x69, 0x21]);
const memoryContainer = Buffer.from("486921", "hex");

console.log(memoryContainer);

console.log(`0x${memoryContainer.toString("hex")}`);
console.log(memoryContainer.toString("utf-8"));
console.log(memoryContainer.toString("utf-16le"));
