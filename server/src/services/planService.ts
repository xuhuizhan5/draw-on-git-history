import type {
  CommitIntensityMap,
  CommitPlanEntry,
  CommitPlanSummary,
  DateRange,
  GridPayload,
} from "../../../shared/src/types";
import { buildCommitPlan } from "../domain/commitPlan";

/**
 * Result of building a plan, including warnings that are safe for display.
 */
export interface PlanResult {
  plan: CommitPlanEntry[];
  summary: CommitPlanSummary;
  warnings: string[];
}

/**
 * Creates a commit plan and attaches UX-friendly warnings.
 *
 * @param grid Grid payload.
 * @param dateRange Date range.
 * @param intensityMap Intensity map.
 * @param randomSeed Optional seed for deterministic randomness.
 * @return Plan result.
 */
export function createPlan(
  grid: GridPayload,
  dateRange: DateRange,
  intensityMap: CommitIntensityMap,
  randomSeed?: string
): PlanResult {
  const { plan, summary } = buildCommitPlan(
    grid,
    dateRange,
    intensityMap,
    randomSeed
  );

  const warnings: string[] = [];
  if (summary.totalCommits > 2500) {
    warnings.push(
      "High commit volume detected. Consider lowering intensity levels if you want a subtle graph."
    );
  }
  if (summary.activeDays < 30) {
    warnings.push(
      "Very few active days. The graph may look sparse; increase some intensity levels if desired."
    );
  }

  return { plan, summary, warnings };
}
