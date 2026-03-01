import { open } from "fs/promises";
import { pipeline } from "stream/promises";
import { stat } from "fs/promises";
import { EncryptStream } from "./encryption.js";
import { DecryptStream } from "./decryption.js";

const getFileSize = async (path) => {
  try {
    const stats = await stat(path);
    return stats.size;
  } catch {
    return 0;
  }
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const processFile = async (src, dest, TransformClass, operation) => {
  let readFileHandle;
  let writeFileHandle;

  try {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔐 ${operation.toUpperCase()}`);
    console.log("=".repeat(60));

    const startTime = Date.now();
    const srcSize = await getFileSize(src);

    console.log(`📂 Source: ${src} (${formatBytes(srcSize)})`);
    console.log(`📝 Destination: ${dest}`);
    console.log(`⏳ Processing...`);

    readFileHandle = await open(src, "r");
    writeFileHandle = await open(dest, "w");

    await pipeline(
      readFileHandle.createReadStream({ highWaterMark: 64 * 1024 }),
      new TransformClass(),
      writeFileHandle.createWriteStream(),
    );

    const endTime = Date.now();
    const destSize = await getFileSize(dest);
    const duration = endTime - startTime;

    console.log(`\n📊 Statistics:`);
    console.log(`   Time: ${duration}ms`);
    console.log(`   Input size: ${formatBytes(srcSize)}`);
    console.log(`   Output size: ${formatBytes(destSize)}`);
    console.log(`   Throughput: ${formatBytes(srcSize / (duration / 1000))}/s`);
    console.log(`✅ ${operation} succeeded`);
  } catch (err) {
    console.error(`\n❌ ${operation} failed:`, err.message);
    throw err;
  } finally {
    if (readFileHandle) await readFileHandle.close();
    if (writeFileHandle) await writeFileHandle.close();
  }
};

// Main execution
(async () => {
  try {
    console.log("🚀 Starting encryption/decryption process...");

    // Encrypt
    await processFile("src.txt", "encrypted.txt", EncryptStream, "Encryption");

    // Decrypt
    await processFile(
      "encrypted.txt",
      "decrypted.txt",
      DecryptStream,
      "Decryption",
    );

    // Verify
    console.log(`\n${"=".repeat(60)}`);
    console.log("🔍 VERIFICATION");
    console.log("=".repeat(60));

    const srcSize = await getFileSize("src.txt");
    const decSize = await getFileSize("decrypted.txt");

    if (srcSize === decSize) {
      console.log("✅ File sizes match!");
      console.log(`   Original: ${formatBytes(srcSize)}`);
      console.log(`   Decrypted: ${formatBytes(decSize)}`);
    } else {
      console.log("❌ File sizes don't match!");
      console.log(`   Original: ${formatBytes(srcSize)}`);
      console.log(`   Decrypted: ${formatBytes(decSize)}`);
    }

    console.log("\n🎉 All operations complete!");
  } catch (err) {
    console.error("\n💥 Fatal error:", err);
    process.exit(1);
  }
})();
