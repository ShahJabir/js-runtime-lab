import net from "net";

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "localhost";
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "20", 10);

const clients = [];
let nextClientId = 1;
let retry = 0;
let isRetrying = false;

const server = net.createServer();

server.on("connection", (socket) => {
  // Assign a unique client ID
  const clientId = nextClientId++;
  socket.clientId = clientId;
  clients.push(socket);

  // Notify all other clients that a new client has joined
  clients.forEach((client) => {
    if (client !== socket && client.writable) {
      client.write(`Client ${clientId} joined the chat\n`);
    }
  });
  console.log(
    `[CONNECTION] Client ${clientId} connected: ${socket.remoteAddress}:${socket.remotePort}`,
  );

  // Send the client its ID
  socket.write(`YOUR_ID:${clientId}\n`);

  socket.on("data", (data) => {
    const msg = data.toString("utf-8").trim();

    // Expect message format: <clientId>:<message>
    const separatorIdx = msg.indexOf(":");
    let senderId = "unknown";
    let message = msg;
    if (separatorIdx !== -1) {
      senderId = msg.slice(0, separatorIdx);
      message = msg.slice(separatorIdx + 1);
    }

    // Print log with sender id and message
    console.log(`[DATA] Received: Client ${senderId}: ${message}`);

    // Broadcast to all connected clients (except the sender)
    clients.forEach((client) => {
      if (client !== socket && client.writable) {
        client.write(`Client ${senderId}: ${message}\n`);
      }
    });
  });

  socket.on("error", (err) => {
    console.error(`[SOCKET ERROR] ${err.code}: ${err.message}`);
  });

  socket.on("close", (hadError) => {
    const status = hadError ? "with error" : "normally";
    console.log(
      `[CONNECTION] Client ${socket.clientId} disconnected ${status}`,
    );

    // Remove the disconnected socket from clients array
    const index = clients.indexOf(socket);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });

  socket.on("end", () => {
    console.log(`[CONNECTION] Client ${socket.clientId} initiated close`);
  });
});

server.on("listening", () => {
  console.log(`[SERVER] Listening on ${HOST}:${PORT}`);
  retry = 0;
});

server.on("error", (err) => {
  const errorCode = err.code || err.errors?.[0]?.code || "UNKNOWN";
  const errorMsg = err.message || err.errors?.[0]?.message || "Unknown error";

  console.error(`[SERVER ERROR] ${errorCode}: ${errorMsg}`);

  if (err.code === "EADDRINUSE" && !isRetrying) {
    handleAddressInUse();
  } else if (err.code === "EACCES") {
    console.error(
      `[SERVER ERROR] Permission denied for ${HOST}:${PORT}. Use port > 1024 or run with sudo`,
    );
    process.exit(1);
  } else if (err.code === "EADDRNOTAVAIL") {
    console.error(
      `[SERVER ERROR] Address ${HOST} not available on this machine`,
    );
    process.exit(1);
  } else if (err.code === "EINVAL") {
    console.error(`[SERVER ERROR] Invalid PORT or HOST configuration`);
    process.exit(1);
  } else if (!isRetrying) {
    console.error(`[SERVER ERROR] Unexpected error, exiting...`);
    process.exit(1);
  }
});

function handleAddressInUse() {
  isRetrying = true;
  console.error(
    `[RETRY] ${HOST}:${PORT} in use, retrying ${retry + 1}/${MAX_RETRIES}...`,
  );

  setTimeout(() => {
    retry++;
    if (retry < MAX_RETRIES) {
      server.listen(PORT, HOST);
    } else {
      console.error(
        `[SERVER ERROR] Max retries reached. Port ${PORT} still in use`,
      );
      console.error(
        `[TIP] Run: lsof -i :${PORT} (Mac/Linux) or netstat -ano | findstr :${PORT} (Windows)`,
      );
      process.exit(1);
    }
    isRetrying = false;
  }, 1000);
}

process.on("SIGINT", () => {
  console.log(`\n[SHUTDOWN] Received SIGINT, closing server...`);
  server.close(() => {
    console.log(`[SHUTDOWN] Server closed`);
    process.exit(0);
  });

  setTimeout(() => {
    console.error(`[SHUTDOWN] Forced exit after timeout`);
    process.exit(1);
  }, 5000);
});

process.on("SIGTERM", () => {
  console.log(`\n[SHUTDOWN] Received SIGTERM, closing server...`);
  server.close(() => {
    console.log(`[SHUTDOWN] Server closed`);
    process.exit(0);
  });
});

console.log(`[SERVER] Starting on ${HOST}:${PORT}...`);
server.listen(PORT, HOST);
