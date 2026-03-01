import { open } from "node:fs/promises";

(async () => {
  let readChunks = 0;
  let writtenChunks = 0;
  let totalBytes = 0;
  let drainCount = 0;

  console.log("📂 Opening files...");

  const readHandle = await open("src.txt", "r");
  const writeHandle = await open("dest.txt", "w");

  console.log("✅ Files opened\n");

  const readStream = readHandle.createReadStream({
    highWaterMark: 64 * 1024, // 64 KB
  });

  const writeStream = writeHandle.createWriteStream();

  console.log("📋 STREAM INFO");
  console.log("─".repeat(50));
  console.log(`Read buffer:  ${readStream.readableHighWaterMark} bytes`);
  console.log(`Write buffer: ${writeStream.writableHighWaterMark} bytes`);
  console.log("─".repeat(50) + "\n");

  console.log("🚚 Copying data...\n");
  console.time("copyTime");

  readStream.on("data", (chunk) => {
    readChunks++;
    totalBytes += chunk.length;

    console.log("─".repeat(50));
    console.log(`📦 Read chunk #${readChunks}`);
    console.log(`   Size: ${chunk.length.toLocaleString()} bytes`);
    console.log(`   Preview: ${chunk.toString().substring(0, 40)}...`);

    const canContinue = writeStream.write(chunk);
    writtenChunks++;

    if (!canContinue) {
      drainCount++;
      console.log(`⏸️  Backpressure! Pausing read (drain #${drainCount})`);
      readStream.pause();
    }
  });

  writeStream.on("drain", () => {
    console.log("▶️  Drain event — resuming read");
    readStream.resume();
  });

  readStream.on("end", () => {
    console.log("\n📭 Read stream ended");
    writeStream.end();
  });

  writeStream.on("finish", async () => {
    console.timeEnd("copyTime");

    console.log("\n" + "═".repeat(50));
    console.log("📊 SUMMARY");
    console.log("═".repeat(50));
    console.log(`Read chunks:      ${readChunks.toLocaleString()}`);
    console.log(`Written chunks:   ${writtenChunks.toLocaleString()}`);
    console.log(`Total bytes:      ${totalBytes.toLocaleString()} bytes`);
    console.log(
      `Average chunk:    ${(totalBytes / readChunks).toFixed(2)} bytes`,
    );
    console.log(`Drain events:     ${drainCount}`);
    console.log("═".repeat(50));
    console.log("✅ Copy complete\n");

    await readHandle.close();
    await writeHandle.close();

    console.log("🔒 Files closed");
  });

  readStream.on("error", (err) => {
    console.error("❌ Read error:", err);
  });

  writeStream.on("error", (err) => {
    console.error("❌ Write error:", err);
  });
})();
