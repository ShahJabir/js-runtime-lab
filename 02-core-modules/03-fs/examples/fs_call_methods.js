// ****** Promise API ****** //
import { copyFile as copyFilePromise } from "fs/promises";

(async () => {
  try {
    await copyFilePromise("./file.txt", "copied-promise.txt");
    console.log("File copied successfully using Promise");
  } catch (error) {
    console.error(error);
  }
})();

// ****** Callback API ****** //
import { copyFile as copyFileCallback } from "fs";

copyFileCallback("./file.txt", "copied-callback.txt", (err) =>
  err
    ? console.error(err)
    : console.log("File copied successfully using callback"),
);

// ****** Synchronous ****** //
import { copyFileSync } from "fs";

try {
  copyFileSync("./file.txt", "copied-sync.txt"); // ← better to use different name
  console.log("File copied successfully using sync method");
} catch (error) {
  console.error(error);
}
