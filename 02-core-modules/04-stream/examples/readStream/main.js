import { open } from "node:fs/promises";

(async () => {
  let totalBuffer = 0;
  let totalBytes = 0;

  console.log("📂 Opening file...");
  const fileHandleRead = await open("src.txt", "r");
  console.log("✅ File opened\n");

  const stream = fileHandleRead.createReadStream({
    highWaterMark: 64 * 1024, // 64 kb
  });

  console.log("📖 Reading chunks...\n");

  stream.on("data", (chunk) => {
    totalBytes += chunk.length;
    totalBuffer++;

    console.log("─".repeat(50));
    console.log(`📦 Chunk #${totalBuffer}`);
    console.log(`   Length: ${totalBytes.toLocaleString()} bytes`);
    console.log(`   First 50 chars: ${chunk.toString().substring(0, 50)}...`);
  });

  // Wait for stream to finish
  await new Promise((resolve, reject) => {
    stream.on("end", () => {
      console.log("");
      console.log("\n" + "═".repeat(50));
      console.log("📊 SUMMARY");
      console.log("═".repeat(50));
      console.log(`Total chunks: ${totalBuffer}`);
      console.log(`Total bytes: ${totalBytes.toLocaleString()}`);
      console.log(
        `Average chunk size: ${(totalBytes / totalBuffer).toFixed(2)} bytes`,
      );
      console.log("\n" + "═".repeat(50));
      console.log("");
      console.log("✅ Stream finished");
      resolve();
    });

    stream.on("error", (err) => {
      console.error("❌ Error:", err);
      reject(err);
    });
  });

  await fileHandleRead.close();
  console.log("🔒 File closed");
})();
