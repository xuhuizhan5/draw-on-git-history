import express from "express";
import cors from "cors";
import { AppConfig } from "./config/config";
import { buildGenerationRouter } from "./routes/generationRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";

/**
 * Creates the Express application.
 *
 * @param config App configuration.
 * @return Express app instance.
 */
export function createApp(config: AppConfig) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", buildGenerationRouter(config));

  app.use(errorHandler);

  return app;
}
