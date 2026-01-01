import path from "node:path";
import { ValidationError } from "./errors";

const SAFE_FOLDER_REGEX = /^[a-zA-Z0-9._-]+$/;

/**
 * Validates a folder name to avoid path traversal.
 *
 * @param value Folder name.
 */
export function assertSafeFolderName(value: string): void {
  if (!value || value.trim().length === 0) {
    throw new ValidationError("Folder name is required.");
  }

  if (!SAFE_FOLDER_REGEX.test(value)) {
    throw new ValidationError(
      "Folder name may only contain letters, numbers, dots, underscores, and dashes."
    );
  }
}

/**
 * Ensures a target path sits within a root directory.
 *
 * @param targetPath Target path.
 * @param rootPath Root directory.
 */
export function assertPathWithinRoot(
  targetPath: string,
  rootPath: string
): void {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedTarget = path.resolve(targetPath);
  const relative = path.relative(resolvedRoot, resolvedTarget);

  if (!relative || relative === "." || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new ValidationError("Target path must be within the output root.");
  }
}
