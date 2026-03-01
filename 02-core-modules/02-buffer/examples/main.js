import { Buffer } from "buffer";

const memoryContainer = Buffer.alloc(4); // 4 bytes (32 bits)

memoryContainer[0] = 0xff;
memoryContainer[1] = 0xa5;
memoryContainer.writeInt8(-34, 2);
memoryContainer[3] = 0xc9;

console.log(memoryContainer);

console.log(memoryContainer[0]);
console.log(memoryContainer[1]);
console.log(memoryContainer.readInt8(2));
console.log(memoryContainer[3]);

console.log(`0x${memoryContainer.toString("hex")}`);
