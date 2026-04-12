import zlib from "zlib";
import fs from "fs";
import { pipeline } from "stream";

const src = fs.createReadStream("./src.txt");
const dest = fs.createWriteStream("./compressed");

pipeline(src, zlib.createGzip(), dest, (err) => {
  console.error(err);
});

console.log("Compression Done ✅");
