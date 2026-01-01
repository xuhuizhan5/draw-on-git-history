import { ValidationError } from "./errors";

/**
 * Date utilities for ISO-8601 dates.
 */
/**
 * Asserts that a date string is a valid ISO date in YYYY-MM-DD format.
 *
 * @param value Date string to validate.
 * @param fieldName Field name for error reporting.
 * @throws {ValidationError} When the date is invalid.
 */
export function assertValidIsoDate(value: string, fieldName: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError(`${fieldName} must be in YYYY-MM-DD format.`);
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} is not a valid date.`);
  }
  const formatted = formatIsoDate(parsed);
  if (formatted !== value) {
    throw new ValidationError(`${fieldName} is not a real calendar date.`);
  }
}

/**
 * Adds a number of days to an ISO date string.
 *
 * @param isoDate Date string in YYYY-MM-DD format.
 * @param days Number of days to add.
 * @return A Date instance advanced by the given number of days.
 */
export function addDays(isoDate: string, days: number): Date {
  assertValidIsoDate(isoDate, "date");
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Formats a Date to YYYY-MM-DD in local time.
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
 * Formats a Date to a Git-compatible ISO timestamp with timezone offset.
 *
 * @param date Date instance.
 * @return Timestamp in `YYYY-MM-DDTHH:mm:ss+/-HHMM`.
 */
export function formatGitTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
  const offsetMins = String(absMinutes % 60).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}${offsetMins}`;
}

/**
 * Computes the number of full days between two ISO dates.
 *
 * @param startDate Inclusive start date.
 * @param endDate Inclusive end date.
 * @return Difference in days.
 */
export function diffInDays(startDate: string, endDate: string): number {
  assertValidIsoDate(startDate, "startDate");
  assertValidIsoDate(endDate, "endDate");
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}
