import Backlia from "./../backlia.js";

const app = new Backlia();

app.route("GET", "/", async (_, res) => {
  await res.sendFile("./public/index.html", "text/html");
});

app.route("GET", "/style.css", async (_, res) => {
  await res.sendFile("./public/style.css", "text/css");
});

app.route("GET", "/script.js", async (_, res) => {
  await res.sendFile("./public/script.js", "application/javascript");
});

app.listen("127.0.0.2", "8230", () => {
  console.log("Server connected on http://127.0.0.2:8230");
});
