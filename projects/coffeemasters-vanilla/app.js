import { Store } from "./Service/Store.js";
import { loadData } from "./Service/Menu.js";
import { Router } from "./Service/Router.js";

window.app = {};
app.store = Store;
app.router = Router;

window.addEventListener("DOMContentLoaded", () => {
  loadData();
  const redirect = sessionStorage.getItem("redirect");
  if (redirect) {
    sessionStorage.removeItem("redirect");
    history.replaceState({ route: redirect }, "", redirect);
  }
  app.router.init();
});
