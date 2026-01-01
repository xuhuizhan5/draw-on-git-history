import fs from "node:fs/promises";
import path from "node:path";
import { Request, Response, NextFunction } from "express";
import type {
  GenerateRequest,
  PreviewRequest,
} from "../../../shared/src/types";
import { AppConfig } from "../config/config";
import { createPlan } from "../services/planService";
import { generateRepository } from "../services/gitService";
import { ValidationError } from "../utils/errors";
import { assertPathWithinRoot, assertSafeFolderName } from "../utils/validation";

/**
 * Controller dependencies for commit generation.
 */
export interface GenerationControllerDeps {
  config: AppConfig;
}

/**
 * Builds preview and generate handlers.
 *
 * @param deps Controller dependencies.
 * @return Controller handlers.
 */
export function createGenerationController(deps: GenerationControllerDeps) {
  const { config } = deps;

  return {
    /**
     * Handles preview requests.
     */
    async preview(req: Request, res: Response, next: NextFunction) {
      try {
        const payload = req.body as PreviewRequest;
        assertSafeFolderName(payload.folderName);
        const outputRoot = resolveOutputRoot(payload.outputRoot, config);
        const planResult = createPlan(
          payload.grid,
          payload.dateRange,
          payload.intensityMap ?? config.intensityMap,
          payload.randomSeed
        );

        res.status(200).json({
          summary: planResult.summary,
          warnings: planResult.warnings,
          plan: planResult.plan,
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Handles generation requests.
     */
    async generate(req: Request, res: Response, next: NextFunction) {
      try {
        const payload = req.body as GenerateRequest;
        assertSafeFolderName(payload.folderName);
        const outputRoot = resolveOutputRoot(payload.outputRoot, config);
        const repoPath = path.join(outputRoot, payload.folderName);

        const planResult = createPlan(
          payload.grid,
          payload.dateRange,
          payload.intensityMap ?? config.intensityMap,
          payload.randomSeed
        );

        if (payload.overwriteExisting) {
          await removeExistingRepo(repoPath, outputRoot);
        }

        const gitLogSample = await generateRepository({
          repoPath,
          plan: planResult.plan,
          summary: planResult.summary,
          authorName: payload.author?.name ?? config.defaultAuthorName,
          authorEmail: payload.author?.email ?? config.defaultAuthorEmail,
          randomSeed: payload.randomSeed,
          dryRun: payload.dryRun,
        });

        res.status(200).json({
          summary: planResult.summary,
          repoPath,
          gitLogSample,
        });
      } catch (error) {
        next(error);
      }
    },
  };
}

/**
 * Resolves the output root based on server policy.
 *
 * @param requestedRoot Requested output root.
 * @param config App configuration.
 * @return Output root path.
 */
function resolveOutputRoot(
  requestedRoot: string | undefined,
  config: AppConfig
): string {
  if (requestedRoot && !config.allowOutputRootOverride) {
    throw new ValidationError("Output root override is disabled by server.");
  }

  return path.resolve(requestedRoot ?? config.outputRoot);
}

/**
 * Deletes an existing repository folder when overwriting is requested.
 *
 * @param repoPath Repository path.
 * @param outputRoot Output root to validate against.
 */
async function removeExistingRepo(
  repoPath: string,
  outputRoot: string
): Promise<void> {
  assertPathWithinRoot(repoPath, outputRoot);

  try {
    const stats = await fs.stat(repoPath);
    if (!stats.isDirectory()) {
      throw new ValidationError("Target path exists and is not a directory.");
    }
    await fs.rm(repoPath, { recursive: true, force: true });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return;
    }
    throw error;
  }
}
