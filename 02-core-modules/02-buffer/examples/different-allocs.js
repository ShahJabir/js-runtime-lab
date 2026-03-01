import { Buffer } from "buffer";

const iterations = 1000000;

// Test Buffer.alloc()
console.time("alloc");
for (let i = 0; i < iterations; i++) {
  Buffer.alloc(1024); // Must zero-fill 1KB each time
}
console.timeEnd("alloc");
// alloc: ~429.172ms

// Test Buffer.allocUnsafe()
console.time("allocUnsafe");
for (let i = 0; i < iterations; i++) {
  Buffer.allocUnsafe(1024); // Just grab memory
}
console.timeEnd("allocUnsafe");
// allocUnsafe: ~152.393ms

// allocUnsafe is 2-3x faster! ⚡

// Simulate some previous operation that stored sensitive data
const oldBuffer = Buffer.from("password123");
// ... oldBuffer gets garbage collected ...

// Later, you allocate a new buffer
const unsafeBuffer = Buffer.allocUnsafe(20);
console.log(unsafeBuffer.toString("utf8"));
// Might output: "password123..." 😱

// The old password is still in memory!
