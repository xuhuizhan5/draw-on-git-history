import path from "node:path";
import type { CommitIntensityMap } from "../../../shared/src/types";

/**
 * Application configuration values used by the API server.
 */
export interface AppConfig {
  /** Port where the HTTP server listens. */
  port: number;
  /** Root directory where generated repos will be created. */
  outputRoot: string;
  /** The default author name to set for generated commits. */
  defaultAuthorName: string;
  /** The default author email to set for generated commits. */
  defaultAuthorEmail: string;
  /**
   * Default mapping from intensity levels to commit count ranges.
   * Each level uses a random count within its range.
   */
  intensityMap: CommitIntensityMap;
  /** Whether the API accepts a request-level outputRoot override. */
  allowOutputRootOverride: boolean;
}

/**
 * Loads configuration from environment variables and defaults.
 *
 * @return Fully populated AppConfig.
 */
export function loadConfig(): AppConfig {
  const outputRoot = path.resolve(
    process.env.OUTPUT_ROOT ?? path.join(process.cwd(), "..")
  );

  const intensityMap: CommitIntensityMap = {
    minByLevel: {
      0: 0,
      1: 1,
      2: 3,
      3: 6,
      4: 10,
    },
    maxByLevel: {
      0: 0,
      1: 2,
      2: 5,
      3: 9,
      4: 14,
    },
  };

  return {
    port: Number(process.env.PORT ?? 4321),
    outputRoot,
    defaultAuthorName: process.env.GIT_AUTHOR_NAME ?? "Draw Bot",
    defaultAuthorEmail: process.env.GIT_AUTHOR_EMAIL ?? "drawbot@example.com",
    intensityMap,
    allowOutputRootOverride: process.env.ALLOW_OUTPUT_ROOT_OVERRIDE === "true",
  };
}
