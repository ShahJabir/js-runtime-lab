import zlib from "zlib";
import fs from "fs";
import { pipeline } from "stream";

const fileName = process.argv[2];

if (!fileName) {
  console.error(
    "Please provide a filename. Example: node compression.js ./src.txt",
  );
  process.exit(1);
}

const src = fs.createReadStream(fileName);
const dest = fs.createWriteStream("./compressed");

pipeline(src, zlib.createGzip(), dest, (err) => {
  console.error(err);
});

console.log("Compression Done ✅");
