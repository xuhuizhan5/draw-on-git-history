/**
 * Shared domain types for the draw-on-git-history application.
 *
 * These types are imported by both the server and web client to keep the
 * API contract consistent.
 */

/**
 * Contribution intensity level per cell. 0 means no commits.
 */
export type CommitLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Grid definition for the 7x51 contribution canvas.
 */
export interface GridPayload {
  /** The number of rows in the grid; expected to be 7. */
  rows: number;
  /** The number of columns in the grid; expected to be 51. */
  cols: number;
  /**
   * Grid levels organized by row then column.
   * Example: levels[rowIndex][colIndex].
   */
  levels: CommitLevel[][];
}

/**
 * Date range describing the first and last day covered by the grid.
 * Dates must be ISO-8601 in `YYYY-MM-DD` format.
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Mapping for how many commits each level should generate.
 */
export interface CommitIntensityMap {
  /** Minimum commits for each level. */
  minByLevel: Record<CommitLevel, number>;
  /** Maximum commits for each level. */
  maxByLevel: Record<CommitLevel, number>;
}

/**
 * Author identity for generated commits.
 */
export interface AuthorInfo {
  /** Git author name. */
  name: string;
  /** Git author email. */
  email: string;
}

/**
 * Request payload for previewing a commit plan.
 */
export interface PreviewRequest {
  /**
   * The name of the repository folder to create under the output root.
   * Must be a safe relative folder name.
   */
  folderName: string;
  /** Optional override for the output root on the server. */
  outputRoot?: string;
  /** Date range for the grid. */
  dateRange: DateRange;
  /** The grid definition. */
  grid: GridPayload;
  /** Optional commit intensity map overrides. */
  intensityMap?: CommitIntensityMap;
  /** Optional random seed for reproducible commit generation. */
  randomSeed?: string;
  /** Optional commit author identity override. */
  author?: AuthorInfo;
}

/**
 * Request payload for generating commits.
 */
export interface GenerateRequest extends PreviewRequest {
  /** When true, no Git commands will be executed. */
  dryRun?: boolean;
  /** When true, existing repo folder will be deleted first. */
  overwriteExisting?: boolean;
  /** Optional progress id for streaming updates. */
  progressId?: string;
}

/**
 * Per-day commit plan entry.
 */
export interface CommitPlanEntry {
  /** Date in `YYYY-MM-DD` format. */
  date: string;
  /** Level chosen for the date. */
  level: CommitLevel;
  /** Planned number of commits for the date. */
  commitCount: number;
}

/**
 * Summary of the generated plan.
 */
export interface CommitPlanSummary {
  /** Total number of commits across all days. */
  totalCommits: number;
  /** Number of days with at least one commit. */
  activeDays: number;
  /** First date in the grid. */
  firstGridDate: string;
  /** Last date in the grid. */
  lastGridDate: string;
  /**
   * Date range requested by the user. When valid it matches
   * the grid bounds; otherwise it reflects the input.
   */
  requestedRange: DateRange;
}

/**
 * Preview response for a commit plan.
 */
export interface PreviewResponse {
  summary: CommitPlanSummary;
  warnings: string[];
  plan: CommitPlanEntry[];
}

/**
 * Generation response after creating the Git repo and commits.
 */
export interface GenerateResponse {
  summary: CommitPlanSummary;
  /** Warnings for UI display. */
  warnings: string[];
  /** Absolute path to the generated repository. */
  repoPath: string;
  /** A short sample of the Git log after generation. */
  gitLogSample: string[];
}
