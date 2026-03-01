import EventEmitter from "./events.js";

const myE = new EventEmitter();

myE.on("foo", () => {
  console.log("Event occured 1.");
});

myE.on("foo", () => {
  console.log("Event occured 2.");
});

myE.on("foo", (x) => {
  console.log(`Event occured using parameter ${x}.`);
});

myE.once("ring", () => {
  console.log("ALARM RINGING! Time to wake up!");
});

myE.on("error", (error) => {
  new Error(error);
});

try {
  myE.emit("foo", "Hello");
  myE.emit("ring");
  myE.emit("ring");

  console.log(myE.listenerCount("foo"));
  console.log(myE.listenerCount("ring"));
} catch (error) {
  myE.emit("error", error);
}
