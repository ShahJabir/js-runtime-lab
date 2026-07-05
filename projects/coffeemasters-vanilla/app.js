import { Store } from "./Service/Store.js";
import { loadData } from "./Service/Menu.js";

window.app = {};
app.store = Store;

window.addEventListener("DOMContentLoaded", () => {
  loadData();
});
