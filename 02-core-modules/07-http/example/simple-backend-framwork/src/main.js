import Backlia from "./../backlia.js";

const app = new Backlia();

app.listen("127.0.0.2", "8230", () => {
  console.log("Server connected on http://127.0.0.2:8230");
});
