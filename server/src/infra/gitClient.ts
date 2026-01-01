import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Runs a Git command and returns stdout.
 *
 * @param cwd Working directory.
 * @param args Git arguments.
 * @param env Optional environment overrides.
 * @return Stdout string.
 */
export async function runGit(
  cwd: string,
  args: string[],
  env?: NodeJS.ProcessEnv
): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    env: env ?? process.env,
  });
  return stdout.trim();
}
