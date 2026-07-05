export const Router = {
  init: () => {
    document.querySelectorAll("a.navlink").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const url = link.getAttribute("href");
        Router.go(url);
      });
    });
    window.addEventListener("popstate", (e) => {
      Router.go(e.state?.route || location.pathname, false);
    });
    Router.go(location.pathname);
  },
  go: (route, addToHistory = true) => {
    if (addToHistory) {
      history.pushState({ route }, "", route);
    }
    let pageElement = null;
    switch (route) {
      case "/index.html":
        pageElement = document.createElement("div");
        pageElement.innerHTML = "<h1>Home</h1><p>Welcome to the home page!</p>";
        break;
      case "/":
        pageElement = document.createElement("div");
        pageElement.innerHTML = "<h1>Home</h1><p>Welcome to the home page!</p>";
        break;
      case "/order":
        pageElement = document.createElement("div");
        pageElement.innerHTML = "<h1>Order</h1><p>Place your order here.</p>";
        break;
      default:
        if (route.startsWith("/product-")) {
          pageElement = document.createElement("div");
          const paramId = route.substring(route.lastIndexOf("-") + 1);
          pageElement.dataset.id = paramId;
          pageElement.innerHTML = `<h1>Product</h1><p>View your product ${paramId} details here.</p>`;
        }
    }
    if (pageElement) {
      const main = document.querySelector("main");
      if (main.children.length > 0) {
        main.children[0].remove();
      }
      main.appendChild(pageElement);
      window.scrollX = 0;
      window.scrollY = 0;
    }
  },
};
