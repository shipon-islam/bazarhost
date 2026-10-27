
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import fs from "node:fs";

import { env } from "./config/env.js";
import { UPLOAD_ROOT } from "./config/upload.config.js";
import { errorHandler, notFound } from "./middleware/error.js";
import routes from "./routes/index.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

const allowedOrigins = new Set(env.clientUrls);

// Security.
app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

// CORS: allow configured frontend origins.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(
        new ApiError(403, "Origin not allowed by CORS", {
          code: "CORS",
        }),
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
    maxAge: 86400,
  }),
);

// Request logging.
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.isProd ? "combined" : "dev"));
}

// Request parsing.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

// Rate limiting for API requests.
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

// Create upload directory.
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

// Public image URLs: /uploads/filename.webp
app.use(
  "/uploads",
  express.static(UPLOAD_ROOT, {
    maxAge: "7d",
    index: false,
    dotfiles: "deny",
  }),
);

// Health check.
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      uptime: Math.floor(process.uptime()),
    },
  });
});

// API routes.
app.use("/api/v1", routes);

// 404 and centralized error handling.
app.use(notFound);
app.use(errorHandler);

export default app;
