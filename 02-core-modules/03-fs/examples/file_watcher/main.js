import { open, watch } from "fs/promises";

(async () => {
  let commandFileHandler = null;
  try {
    commandFileHandler = await open("./command.txt", "r");

    commandFileHandler.on("change", async () => {
      // get the size of file
      const size = (await commandFileHandler.stat()).size;
      // allocate our buffer with the size of the file
      const buff = Buffer.alloc(size);
      // the location at which we want to start filling our buffer
      const offset = 0;
      // how many bytes we want to read
      const length = buff.byteLength;
      // the position that we want to start reading file from
      const position = 0;
      // we always want to read the whole content (from beginning all the way to the end)
      const content = await commandFileHandler.read(
        buff,
        offset,
        length,
        position,
      );
      console.log(content);
      console.log(`Content: ${content.buffer.toString("utf-8")}`);
    });

    //  watcher ...
    const watcher = watch("./command.txt");
    for await (const event of watcher) {
      if (event.eventType === "change") {
        commandFileHandler.emit("change");
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    commandFileHandler?.close();
  }
})();
