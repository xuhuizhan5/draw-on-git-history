import type {
  CommitIntensityMap,
  CommitPlanEntry,
  CommitPlanSummary,
  CommitLevel,
  DateRange,
  GridPayload,
} from "../../../shared/src/types";
import { flattenGrid } from "./grid";
import { addDays, assertValidIsoDate, diffInDays, formatIsoDate } from "../utils/date";
import { ValidationError } from "../utils/errors";
import { createRng, randomInt } from "../utils/random";

const EXPECTED_GRID_DAYS = 7 * 51;

/**
 * Builds a commit plan from the grid definition.
 *
 * @param grid Grid payload.
 * @param dateRange Date range for the grid.
 * @param intensityMap Commit intensity ranges.
 * @param randomSeed Optional seed for deterministic randomness.
 * @return Commit plan and summary.
 */
export function buildCommitPlan(
  grid: GridPayload,
  dateRange: DateRange,
  intensityMap: CommitIntensityMap,
  randomSeed?: string
): { plan: CommitPlanEntry[]; summary: CommitPlanSummary } {
  assertValidIsoDate(dateRange.startDate, "startDate");
  assertValidIsoDate(dateRange.endDate, "endDate");

  const expectedEndDate = formatIsoDate(
    addDays(dateRange.startDate, EXPECTED_GRID_DAYS - 1)
  );

  if (dateRange.endDate !== expectedEndDate) {
    throw new ValidationError(
      `endDate must be ${expectedEndDate} for a 7x51 grid.`
    );
  }

  const diffDays = diffInDays(dateRange.startDate, dateRange.endDate);
  if (diffDays !== EXPECTED_GRID_DAYS - 1) {
    throw new ValidationError(
      "Date range does not match 7x51 grid day count."
    );
  }

  const seed = randomSeed ?? `${dateRange.startDate}:${dateRange.endDate}`;
  const rng = createRng(seed);
  const flattened = flattenGrid(grid, dateRange.startDate);

  const plan: CommitPlanEntry[] = flattened.map(({ date, level }) => ({
    date,
    level,
    commitCount: getCommitCountForLevel(level, intensityMap, rng),
  }));

  const summary = summarizePlan(plan, dateRange);

  return { plan, summary };
}

/**
 * Returns the number of commits for a given level.
 *
 * @param level Intensity level.
 * @param intensityMap Range mapping.
 * @param rng Random generator.
 * @return Commit count.
 */
function getCommitCountForLevel(
  level: CommitLevel,
  intensityMap: CommitIntensityMap,
  rng: () => number
): number {
  const min = intensityMap.minByLevel[level];
  const max = intensityMap.maxByLevel[level];

  if (min === undefined || max === undefined) {
    throw new ValidationError(`Missing intensity range for level ${level}.`);
  }

  if (level === 0) {
    return 0;
  }

  if (min > max) {
    throw new ValidationError(
      `Intensity range for level ${level} is invalid (${min} > ${max}).`
    );
  }

  return randomInt(rng, min, max);
}

/**
 * Builds a summary of the commit plan.
 *
 * @param plan Commit plan entries.
 * @param requestedRange Requested date range.
 * @return Summary object.
 */
function summarizePlan(
  plan: CommitPlanEntry[],
  requestedRange: DateRange
): CommitPlanSummary {
  const totalCommits = plan.reduce((sum, entry) => sum + entry.commitCount, 0);
  const activeDays = plan.filter((entry) => entry.commitCount > 0).length;

  return {
    totalCommits,
    activeDays,
    firstGridDate: plan[0]?.date ?? requestedRange.startDate,
    lastGridDate: plan[plan.length - 1]?.date ?? requestedRange.endDate,
    requestedRange,
  };
}
