import http from "node:http";

class Backlia {
  constructor() {
    this.server = http.createServer();
  }
  listen = (HOST = "127.0.0.1", PORT, Callback) => {
    this.server.listen(PORT, HOST, Callback);
  };
}

export default Backlia;
