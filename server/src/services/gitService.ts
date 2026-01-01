import fs from "node:fs/promises";
import path from "node:path";
import type {
  CommitPlanEntry,
  CommitPlanSummary,
} from "../../../shared/src/types";
import { runGit } from "../infra/gitClient";
import { ConflictError, InternalError } from "../utils/errors";
import { createRng, randomInt } from "../utils/random";
import { formatGitTimestamp } from "../utils/date";
import {
  appendDumpMutation,
  buildMutation,
  ensureDumpFile,
} from "./fileMutationService";

/**
 * Options for generating a git history repository.
 */
export interface GenerateRepoOptions {
  /** Target repository path. */
  repoPath: string;
  /** Commit plan entries. */
  plan: CommitPlanEntry[];
  /** Summary for metadata. */
  summary: CommitPlanSummary;
  /** Default author name. */
  authorName: string;
  /** Default author email. */
  authorEmail: string;
  /** Optional seed for deterministic timestamps. */
  randomSeed?: string;
  /** When true, skips Git commands. */
  dryRun?: boolean;
}

/**
 * Creates a Git repository with commit history matching the plan.
 *
 * @param options Generation options.
 * @return Short git log sample.
 */
export async function generateRepository(
  options: GenerateRepoOptions
): Promise<string[]> {
  const {
    repoPath,
    plan,
    summary,
    authorName,
    authorEmail,
    randomSeed,
    dryRun,
  } = options;

  await assertRepoDoesNotExist(repoPath);

  if (dryRun) {
    return [];
  }

  await fs.mkdir(repoPath, { recursive: true });
  await runGit(repoPath, ["init"]);
  await runGit(repoPath, ["config", "user.name", authorName]);
  await runGit(repoPath, ["config", "user.email", authorEmail]);

  await writeRepoMetadata(repoPath, summary);
  const dumpFilePath = await ensureDumpFile(repoPath);

  const seed = randomSeed ?? `${summary.firstGridDate}:${summary.lastGridDate}`;
  const rng = createRng(`${seed}:mutations`);

  for (const entry of plan) {
    if (entry.commitCount <= 0) {
      continue;
    }

    const commitTimes = buildCommitTimes(entry.date, entry.commitCount, rng);
    for (let i = 0; i < commitTimes.length; i += 1) {
      const commitDate = commitTimes[i];
      const timestamp = formatGitTimestamp(commitDate);
      const mutation = buildMutation(rng, entry.date, i + 1);
      await appendDumpMutation(dumpFilePath, mutation);
      await runGit(repoPath, ["add", "dump.txt", "history.json"]);
      await runGit(
        repoPath,
        ["commit", "-m", `chore(history): ${entry.date} #${i + 1}`, "--date", timestamp],
        {
          ...process.env,
          GIT_AUTHOR_DATE: timestamp,
          GIT_COMMITTER_DATE: timestamp,
        }
      );
    }
  }

  return getGitLogSample(repoPath);
}

/**
 * Builds a list of timestamps within a day.
 *
 * @param isoDate Date string.
 * @param count Number of commits.
 * @param rng Random generator.
 * @return Ordered list of Date objects.
 */
function buildCommitTimes(
  isoDate: string,
  count: number,
  rng: () => number
): Date[] {
  const startHour = 9;
  const endHour = 20;
  const start = new Date(`${isoDate}T${String(startHour).padStart(2, "0")}:00:00`);
  const secondsRange = (endHour - startHour) * 60 * 60;

  const times = Array.from({ length: count }, () => {
    const offsetSeconds = randomInt(rng, 0, Math.max(secondsRange - 1, 0));
    const commitDate = new Date(start.getTime());
    commitDate.setSeconds(commitDate.getSeconds() + offsetSeconds);
    return commitDate;
  });

  return times.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Writes a metadata file describing the generated history.
 *
 * @param repoPath Repository path.
 * @param summary Commit summary.
 */
async function writeRepoMetadata(
  repoPath: string,
  summary: CommitPlanSummary
): Promise<void> {
  const metadataPath = path.join(repoPath, "history.json");
  const payload = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      summary,
    },
    null,
    2
  );
  await fs.writeFile(metadataPath, payload, { encoding: "utf8" });
}

/**
 * Ensures that the target repo path does not already exist.
 *
 * @param repoPath Target path.
 */
async function assertRepoDoesNotExist(repoPath: string): Promise<void> {
  try {
    await fs.access(repoPath);
    throw new ConflictError(
      `Repository path already exists: ${repoPath}. Choose another folder name.`
    );
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    return;
  }
}

/**
 * Returns a short git log sample for display.
 *
 * @param repoPath Repository path.
 * @return List of log lines.
 */
async function getGitLogSample(repoPath: string): Promise<string[]> {
  try {
    const output = await runGit(repoPath, ["--no-pager", "log", "-5", "--oneline"]);
    return output ? output.split("\n") : [];
  } catch (error) {
    throw new InternalError("Unable to read git log after generation.");
  }
}
