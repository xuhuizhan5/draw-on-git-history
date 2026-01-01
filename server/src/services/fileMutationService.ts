import fs from "node:fs/promises";
import path from "node:path";
import { randomInt } from "../utils/random";

/**
 * Represents a mutation to the dump file.
 */
export interface DumpMutation {
  /** Timestamp for the mutation. */
  timestamp: string;
  /** Commit index for the day. */
  commitIndex: number;
  /** A random payload string. */
  payload: string;
}

/**
 * Ensures the dump file exists with initial content.
 *
 * @param repoPath Repository path.
 * @return Absolute path to the dump file.
 */
export async function ensureDumpFile(repoPath: string): Promise<string> {
  const filePath = path.join(repoPath, "dump.txt");
  const header = [
    "# Draw-on-Git-History",
    "# This file is mutated to create commit activity.",
    "",
  ].join("\n");
  await fs.writeFile(filePath, header, { encoding: "utf8" });
  return filePath;
}

/**
 * Appends a mutation line to the dump file.
 *
 * @param filePath Absolute path to the dump file.
 * @param mutation Mutation payload.
 */
export async function appendDumpMutation(
  filePath: string,
  mutation: DumpMutation
): Promise<void> {
  const line = `${mutation.timestamp} :: ${mutation.commitIndex} :: ${mutation.payload}\n`;
  await fs.appendFile(filePath, line, { encoding: "utf8" });
}

/**
 * Builds a random mutation payload.
 *
 * @param rng Random generator.
 * @param dateLabel Date label for traceability.
 * @param commitIndex Commit index.
 * @return Mutation payload.
 */
export function buildMutation(
  rng: () => number,
  dateLabel: string,
  commitIndex: number
): DumpMutation {
  const token = generateToken(rng, 16);
  return {
    timestamp: new Date().toISOString(),
    commitIndex,
    payload: `${dateLabel}::${commitIndex}::${token}`,
  };
}

/**
 * Generates an alphanumeric token.
 *
 * @param rng Random generator.
 * @param length Token length.
 * @return Token string.
 */
function generateToken(rng: () => number, length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const index = randomInt(rng, 0, alphabet.length - 1);
    result += alphabet[index];
  }
  return result;
}
