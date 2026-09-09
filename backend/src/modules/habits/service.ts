/**
 * @file service.ts
 * Pure business logic for the Habit Tracker module.
 * No database calls — receives data from the repository layer.
 */

import type { HabitLog } from './types';

/**
 * Computes the length of the current consecutive-day streak ending on `today`.
 *
 * A streak counts the number of consecutive calendar days, ending with today,
 * on which the habit was logged at least once. If today has no log, the streak
 * is 0 (even if yesterday had one — streaks must include today to be "current").
 *
 * @param logs - All HabitLog entries for a single habit
 * @param today - The reference calendar date in YYYY-MM-DD format (defaults to today)
 * @returns The current streak length in days (0 if no streak)
 */
export function computeStreak(logs: HabitLog[], today: string = todayString()): number {
  if (logs.length === 0) return 0;

  // Deduplicate to one entry per calendar date, sorted descending.
  const uniqueDates = [...new Set(logs.map((l) => l.completedOn))].sort().reverse();

  // Streak must include today — if today has no log, streak is 0.
  if (uniqueDates[0] !== today) return 0;

  let streak = 0;
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = subtractDays(today, i);
    if (uniqueDates[i] === expected) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Computes the habit streak consistency score, clamped to [0, 1].
 *
 * Formula:
 *   consistency = current_streak / max(7, days_since_first_log)
 *   clamped to [0, 1]
 *
 * @param currentStreak - The current streak length in days
 * @param firstLogDate - ISO date string of the earliest log (YYYY-MM-DD), or null if no logs
 * @param today - The reference calendar date in YYYY-MM-DD format (defaults to today)
 * @returns A number in [0, 1]
 */
export function computeHabitStreakConsistency(
  currentStreak: number,
  firstLogDate: string | null,
  today: string = todayString(),
): number {
  if (firstLogDate === null || currentStreak === 0) return 0;

  const daysSinceFirst = daysBetween(firstLogDate, today);
  const denominator = Math.max(7, daysSinceFirst);
  const raw = currentStreak / denominator;
  return Math.min(1, Math.max(0, raw));
}

// ── Date helpers (pure, no I/O) ───────────────────────────────────────────────

/**
 * Returns today's date as a YYYY-MM-DD string in local time.
 *
 * @returns Today's date string
 */
export function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Subtracts `n` days from a YYYY-MM-DD date string and returns the result.
 *
 * @param dateStr - A calendar date string in YYYY-MM-DD format
 * @param n - Number of days to subtract
 * @returns The resulting date string in YYYY-MM-DD format
 */
export function subtractDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, (m as number) - 1, d as number);
  date.setDate(date.getDate() - n);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Counts the number of calendar days between two YYYY-MM-DD date strings.
 * Returns 0 if `from` equals `to`.
 *
 * @param from - Earlier date string in YYYY-MM-DD format
 * @param to - Later date string in YYYY-MM-DD format
 * @returns Number of days between the two dates
 */
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const fromDate = new Date(fy, (fm as number) - 1, fd as number);
  const toDate = new Date(ty, (tm as number) - 1, td as number);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((toDate.getTime() - fromDate.getTime()) / msPerDay);
}
