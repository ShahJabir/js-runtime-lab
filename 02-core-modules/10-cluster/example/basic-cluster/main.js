import cluster from "node:cluster";
import os from "node:os";
import http from "node:http";

/* ======================
   CONFIG
====================== */
const APP_PORT = 3000;
const METRICS_PORT = 9090;
const DASHBOARD_INTERVAL = 1000;

/* ======================
   PRIMARY PROCESS
====================== */
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  const metrics = new Map();

  console.log(`Primary PID ${process.pid}`);
  console.log(`Starting ${numCPUs} workers...\n`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();

    worker.on("message", (msg) => {
      if (msg.type === "metrics") {
        metrics.set(msg.pid, msg);
      }
    });
  }

  // Restart dead workers
  cluster.on("exit", (worker) => {
    log("worker_exit", { pid: worker.process.pid });
    cluster.fork();
  });

  // Terminal dashboard
  setInterval(() => {
    console.clear();
    console.log("=== NODE CLUSTER DASHBOARD ===\n");

    for (const m of metrics.values()) {
      const bar = "█".repeat(Math.min(m.requests, 40));
      console.log(
        `PID ${m.pid} | Req ${m.requests.toString().padEnd(5)} | Mem ${(m.memory / 1e6).toFixed(1)}MB`,
      );
      console.log(bar + "\n");
    }

    console.log("Ctrl+C to exit");
  }, DASHBOARD_INTERVAL);

  // Metrics endpoint (Prometheus-style)
  http
    .createServer((req, res) => {
      if (req.url === "/metrics") {
        let out = "";
        for (const m of metrics.values()) {
          out += `worker_requests{pid="${m.pid}"} ${m.requests}\n`;
          out += `worker_memory_bytes{pid="${m.pid}"} ${m.memory}\n`;
        }
        res.end(out);
      } else {
        res.statusCode = 404;
        res.end("Not Found");
      }
    })
    .listen(METRICS_PORT, () => {
      log("metrics_server_started", { port: METRICS_PORT });
    });

  function log(event, data) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        event,
        ...data,
      }),
    );
  }

  /* ======================
   WORKER PROCESS
====================== */
} else {
  let requests = 0;

  // Send metrics to primary every second
  setInterval(() => {
    process.send({
      type: "metrics",
      pid: process.pid,
      requests,
      memory: process.memoryUsage().rss,
    });
  }, 1000);

  // HTTP server
  http
    .createServer((_, res) => {
      requests++;
      res.end(`Handled by worker PID ${process.pid}\n`);
    })
    .listen(APP_PORT, () => {
      console.log(`Worker PID ${process.pid} listening on ${APP_PORT}`);
    });
}
