import zlib from "zlib";
import fs from "fs";
import { pipeline } from "stream";

const extension = process.argv[2];

if (!extension) {
  console.error(
    "Please provide a file extension. Example: node decompression.js .gz/gz",
  );
  process.exit(1);
}

const src = fs.createReadStream("./compressed");
let dest;

if (extension[0] === ".") {
  dest = fs.createWriteStream(`./decompressed${extension}`);
} else {
  dest = fs.createWriteStream(`./decompressed.${extension}`);
}

pipeline(src, zlib.createGunzip(), dest, (err) => {
  console.error(err);
});

console.log("Decompression Done ✅");
