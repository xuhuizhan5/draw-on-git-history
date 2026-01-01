import type { CommitLevel, GridPayload } from "../../../shared/src/types";
import { addDays, assertValidIsoDate, formatIsoDate } from "../utils/date";
import { ValidationError } from "../utils/errors";

/**
 * Validates the grid shape and contents.
 *
 * @param grid Grid payload to validate.
 * @throws {ValidationError} When the grid is malformed.
 */
export function validateGrid(grid: GridPayload): void {
  if (grid.rows !== 7 || grid.cols !== 51) {
    throw new ValidationError(
      `Grid must be 7x51, received ${grid.rows}x${grid.cols}.`
    );
  }

  if (grid.levels.length !== grid.rows) {
    throw new ValidationError("Grid levels row count does not match rows.");
  }

  grid.levels.forEach((row, rowIndex) => {
    if (row.length !== grid.cols) {
      throw new ValidationError(
        `Grid row ${rowIndex} does not match column count.`
      );
    }

    row.forEach((level, colIndex) => {
      if (![0, 1, 2, 3, 4].includes(level)) {
        throw new ValidationError(
          `Grid cell at (${rowIndex}, ${colIndex}) has invalid level ${level}.`
        );
      }
    });
  });
}

/**
 * Computes the date string for a grid cell.
 *
 * @param startDate First date in the grid (top-left cell).
 * @param rowIndex Row index, where 0 represents Sunday.
 * @param colIndex Column index, starting at 0.
 * @return ISO date string for the cell.
 */
export function getDateForCell(
  startDate: string,
  rowIndex: number,
  colIndex: number
): string {
  assertValidIsoDate(startDate, "startDate");
  const offsetDays = colIndex * 7 + rowIndex;
  const date = addDays(startDate, offsetDays);
  return formatIsoDate(date);
}

/**
 * Flattens the grid into a chronological list of date-level pairs.
 *
 * @param grid Grid payload.
 * @param startDate First date in the grid.
 * @return List of tuples containing date and level.
 */
export function flattenGrid(
  grid: GridPayload,
  startDate: string
): Array<{ date: string; level: CommitLevel }> {
  validateGrid(grid);

  const flattened: Array<{ date: string; level: CommitLevel }> = [];

  for (let colIndex = 0; colIndex < grid.cols; colIndex += 1) {
    for (let rowIndex = 0; rowIndex < grid.rows; rowIndex += 1) {
      const date = getDateForCell(startDate, rowIndex, colIndex);
      const level = grid.levels[rowIndex][colIndex];
      flattened.push({ date, level });
    }
  }

  return flattened;
}
