
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";

const SHUTDOWN_TIMEOUT = 10_000;

let server;
let isShuttingDown = false;
let shutdownTimer;

async function shutdown(signal, exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.info(`${signal} received. Starting graceful shutdown...`);

  shutdownTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  try {
    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await disconnectDB();
    console.info("Database disconnected successfully.");
  } catch (error) {
    console.error("Error during shutdown:", error);
    exitCode = 1;
  } finally {
    clearTimeout(shutdownTimer);
    process.exit(exitCode);
  }
}

async function startServer() {
  try {
    await connectDB();

    server = app.listen(env.PORT, () => {
      console.info(
        `BazarHost API listening on port http://localhost:${env.PORT} (${env.NODE_ENV})`,
      );
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error);
      void shutdown("SERVER_ERROR", 1);
    });

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));

    process.on("unhandledRejection", (error) => {
      console.error("Unhandled promise rejection:", error);
      void shutdown("UNHANDLED_REJECTION", 1);
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught exception:", error);
      void shutdown("UNCAUGHT_EXCEPTION", 1);
    });
  } catch (error) {
    console.error("Failed to start BazarHost API:", error);

    try {
      await disconnectDB();
    } catch (disconnectError) {
      console.error("Database cleanup failed:", disconnectError);
    }

    process.exit(1);
  }
}

await startServer();
