/**
 * @file streakUtils.ts
 * Utility functions for habit streak calculation.
 *
 * FIX (Phase 6): The original implementation used `Date.toISOString()` which
 * returns a UTC date string. In any timezone east of UTC (e.g. UTC+5:30 IST)
 * a completion logged just after local midnight is still the *previous* UTC
 * day, so every comparison failed and the streak was always 0.
 *
 * Fix: normalise completion timestamps to local calendar dates using
 * `getFullYear / getMonth / getDate` instead of `toISOString().split('T')[0]`,
 * and compare YYYY-MM-DD strings directly rather than Date object timestamps.
 */

/**
 * Formats a Date to a YYYY-MM-DD string using the local calendar date,
 * not the UTC date.
 *
 * @param d - The Date to format
 * @returns Local calendar date as a YYYY-MM-DD string
 */
function toLocalDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns today's local calendar date as a YYYY-MM-DD string.
 *
 * @returns Today's date in YYYY-MM-DD format (local time)
 */
function todayLocalString(): string {
  return toLocalDateString(new Date());
}

/**
 * Subtracts `n` days from a YYYY-MM-DD date string and returns the result.
 *
 * @param dateStr - A calendar date string in YYYY-MM-DD format
 * @param n - Number of days to subtract
 * @returns The resulting date in YYYY-MM-DD format
 */
function subtractDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, (m as number) - 1, d as number);
  date.setDate(date.getDate() - n);
  return toLocalDateString(date);
}

/**
 * Computes the current consecutive-day streak from habit completion timestamps.
 *
 * A streak counts the number of consecutive calendar days ending on today
 * on which the habit was completed at least once. If today has no completion
 * the streak is 0, even if yesterday did.
 *
 * @param completionDates - Array of Date objects representing when the habit was completed
 * @returns The length of the current streak in days (0 if no streak)
 */
export function computeStreak(completionDates: Date[]): number {
  if (completionDates.length === 0) return 0;

  const today = todayLocalString();

  // Deduplicate to one entry per local calendar day, sorted descending.
  // FIX: use toLocalDateString() instead of toISOString().split('T')[0]
  // so completions just after midnight are attributed to the correct local day.
  const uniqueDays = [
    ...new Set(completionDates.map((d) => toLocalDateString(d))),
  ]
    .sort()
    .reverse();

  // Streak must include today — if today has no log, streak is 0.
  if (uniqueDays[0] !== today) return 0;

  let streak = 0;
  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = subtractDays(today, i);
    if (uniqueDays[i] === expected) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
