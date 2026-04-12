import zlib from "zlib";
import fs from "fs";
import { pipeline } from "stream";

const src = fs.createReadStream("./compressed");
const dest = fs.createWriteStream("./decompressed");

pipeline(src, zlib.createGunzip(), dest, (err) => {
  console.error(err);
});

console.log("Decompression Done ✅")
