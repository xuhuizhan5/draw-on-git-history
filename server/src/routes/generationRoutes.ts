import { Router } from "express";
import { z } from "zod";
import { createGenerationController } from "../controllers/generationController";
import { AppConfig } from "../config/config";
import { validateBody } from "../middlewares/validateBody";
import {
  ensureProgress,
  getProgress,
  subscribeProgress,
} from "../services/progressService";

/**
 * Builds the router for generation APIs.
 *
 * @param config App configuration.
 * @return Express router.
 */
export function buildGenerationRouter(config: AppConfig): Router {
  const router = Router();
  const controller = createGenerationController({ config });

  const commitLevelSchema = z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]);

  const gridSchema = z.object({
    rows: z.number().int().min(1),
    cols: z.number().int().min(1),
    levels: z.array(z.array(commitLevelSchema)),
  });

  const dateRangeSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
  });

  const folderNameSchema = z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9._-]+$/, {
      message: "Folder name contains invalid characters.",
    });

  const intensityRangeSchema = z.object({
    0: z.number().int().min(0),
    1: z.number().int().min(0),
    2: z.number().int().min(0),
    3: z.number().int().min(0),
    4: z.number().int().min(0),
  });

  const intensityMapSchema = z.object({
    minByLevel: intensityRangeSchema,
    maxByLevel: intensityRangeSchema,
  });

  const authorSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
  });

  const previewSchema = z.object({
    folderName: folderNameSchema,
    outputRoot: z.string().optional(),
    dateRange: dateRangeSchema,
    grid: gridSchema,
    intensityMap: intensityMapSchema.optional(),
    randomSeed: z.string().optional(),
    author: authorSchema.optional(),
  });

  const generateSchema = previewSchema.extend({
    dryRun: z.boolean().optional(),
    overwriteExisting: z.boolean().optional(),
    progressId: z.string().min(1).optional(),
  });

  router.post("/preview", validateBody(previewSchema), controller.preview);
  router.post("/generate", validateBody(generateSchema), controller.generate);
  router.get("/progress/:id", (req, res) => {
    const { id } = req.params;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const send = (state: unknown) => {
      res.write(`data: ${JSON.stringify(state)}\n\n`);
    };

    const initial = getProgress(id) ?? ensureProgress(id);
    send(initial);

    const unsubscribe = subscribeProgress(id, send);
    req.on("close", () => {
      unsubscribe();
    });
  });

  return router;
}
