// This is a simplified version of what Node.js does internally

class BufferPoolManager {
  constructor() {
    this.poolSize = 8 * 1024; // 8KB
    this.pool = null; // Current pool
    this.poolOffset = 0; // Current position in pool
  }

  allocUnsafe(size) {
    // If buffer is too large (> half pool size), don't use pool
    if (size > this.poolSize / 2) {
      return this.allocUnsafeSlow(size);
    }

    // If not enough space in current pool, create new pool
    if (this.pool === null || this.poolSize - this.poolOffset < size) {
      this.createNewPool();
    }

    // Slice from the pool
    const buffer = this.pool.slice(this.poolOffset, this.poolOffset + size);
    this.poolOffset += size;

    return buffer;
  }

  createNewPool() {
    // Allocate new 8KB buffer
    this.pool = Buffer.allocUnsafeSlow(this.poolSize);
    this.poolOffset = 0;
    console.log("Created new pool");
  }

  allocUnsafeSlow(size) {
    // Direct allocation, bypasses pool
    console.log(`Bypassing pool for ${size} bytes`);
    return Buffer.allocUnsafeSlow(size);
  }
}

// Usage example
const poolManager = new BufferPoolManager();

const buf1 = poolManager.allocUnsafe(1000); // From pool
const buf2 = poolManager.allocUnsafe(2000); // From same pool
const buf3 = poolManager.allocUnsafe(6000); // Too large, bypasses pool
const buf4 = poolManager.allocUnsafe(500); // From pool
