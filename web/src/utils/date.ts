/**
 * Frontend date helpers for ISO-8601 dates.
 */

/**
 * Formats a Date to YYYY-MM-DD.
 *
 * @param date Date instance.
 * @return ISO date string.
 */
export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses an ISO date string.
 *
 * @param value Date string.
 * @return Date instance.
 */
export function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

/**
 * Validates an ISO date string.
 *
 * @param value Date string.
 * @return True when valid.
 */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = parseIsoDate(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return formatIsoDate(parsed) === value;
}

/**
 * Adds days to a date.
 *
 * @param isoDate Date string.
 * @param days Days to add.
 * @return New ISO date string.
 */
export function addDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

/**
 * Computes the day difference between two dates.
 *
 * @param startDate Start date.
 * @param endDate End date.
 * @return Difference in days.
 */
export function diffInDays(startDate: string, endDate: string): number {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Calculates a suggested date range for a given year using the first Sunday
 * on or after January 1 and spanning 51 full weeks.
 *
 * @param year Target year.
 * @return Start and end ISO dates.
 */
export function suggestRangeForYear(year: number): {
  startDate: string;
  endDate: string;
} {
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay();
  const firstSunday = new Date(jan1);
  firstSunday.setDate(jan1.getDate() + ((7 - dayOfWeek) % 7));
  const startIso = formatIsoDate(firstSunday);
  const endIso = addDays(startIso, 7 * 51 - 1);
  return { startDate: startIso, endDate: endIso };
}

/**
 * Returns the ISO date for a grid cell.
 *
 * @param startDate Start date.
 * @param rowIndex Row index.
 * @param colIndex Column index.
 * @return ISO date string.
 */
export function getDateForCell(
  startDate: string,
  rowIndex: number,
  colIndex: number
): string {
  const offset = colIndex * 7 + rowIndex;
  return addDays(startDate, offset);
}
