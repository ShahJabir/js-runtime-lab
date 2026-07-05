import { Store } from "./Service/Store.js";
import { loadData } from "./Service/Menu.js";
import { Router } from "./Service/Router.js";

window.app = {};
app.store = Store;
app.router = Router;

window.addEventListener("DOMContentLoaded", () => {
  loadData();
  app.router.init();
});
