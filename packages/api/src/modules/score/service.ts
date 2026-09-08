/**
 * @file service.ts
 * Business logic for the Productivity Score module.
 *
 * Orchestrates the three sub-rates by calling the tasks, reminders, and
 * habits service functions directly — never queries the DB itself.
 * The formula and weights are server-enforced and not configurable.
 */

import type { ProductivityScore } from './types';

// ── Cross-module service imports ───────────────────────────────────────────────
// Services are called here; repositories are accessed only inside those modules.
import { computeTaskCompletionRate } from '../tasks/service';
import { computeReminderAckRate } from '../reminders/service';
import { computeStreak, computeHabitStreakConsistency, todayString } from '../habits/service';

// ── Repository imports — data fetch only, no business logic used here ──────────
import { findAll as findAllTasks } from '../tasks/repository';
import { findDue as findDueReminders } from '../reminders/repository';
import { findAll as findAllHabits, findAllLogs } from '../habits/repository';

// ── Weight constants ───────────────────────────────────────────────────────────

/** Weight applied to the task completion rate. Must not be changed. */
export const WEIGHT_TASKS = 0.4 as const;

/** Weight applied to the reminder acknowledgement rate. Must not be changed. */
export const WEIGHT_REMINDERS = 0.3 as const;

/** Weight applied to the habit streak consistency. Must not be changed. */
export const WEIGHT_HABITS = 0.3 as const;

// ── Core computation ───────────────────────────────────────────────────────────

/**
 * Computes the overall Productivity Score for the given user.
 *
 * Steps:
 *  1. Fetches raw data via the module repositories.
 *  2. Derives each sub-rate by calling the relevant module service function.
 *  3. Applies the weighted formula and returns a score in [0, 100].
 *
 * Formula (weights are hard-coded constants — 0.4 / 0.3 / 0.3):
 *   score = (taskCompletionRate * 0.4
 *          + reminderAckRate    * 0.3
 *          + habitStreakConsistency * 0.3) * 100
 *
 * Result is clamped to [0, 100] and rounded to 2 decimal places.
 *
 * @param userId - The user's primary key
 * @returns A fully populated ProductivityScore object
 */
export function computeScoreForUser(userId: number): ProductivityScore {
  // ── Task completion rate (via tasks service) ───────────────────────────────
  const tasks = findAllTasks(userId);
  const taskCompletionRate = computeTaskCompletionRate(tasks);

  // ── Reminder acknowledgement rate (via reminders service) ─────────────────
  const dueReminders = findDueReminders(userId);
  const reminderAckRate = computeReminderAckRate(dueReminders);

  // ── Habit streak consistency (via habits service) ──────────────────────────
  const habits = findAllHabits(userId);
  let habitStreakConsistency = 0;

  if (habits.length > 0) {
    const today = todayString();
    const allLogs = findAllLogs(userId);
    const streak = computeStreak(allLogs, today);
    const firstLogDate =
      allLogs.length > 0
        ? allLogs.reduce(
            (min, l) => (l.completedOn < min ? l.completedOn : min),
            allLogs[0].completedOn,
          )
        : null;
    habitStreakConsistency = computeHabitStreakConsistency(streak, firstLogDate, today);
  }

  return computeProductivityScore(taskCompletionRate, reminderAckRate, habitStreakConsistency);
}

/**
 * Applies the weighted formula to three pre-computed sub-rates.
 *
 * Kept as a separate pure function so it can be called directly in tests
 * without triggering any database access.
 *
 * @param taskCompletionRate - Fraction of done tasks in [0, 1]
 * @param reminderAckRate - Fraction of acknowledged due reminders in [0, 1]
 * @param habitStreakConsistency - Habit streak consistency ratio in [0, 1]
 * @returns A fully populated ProductivityScore object
 */
export function computeProductivityScore(
  taskCompletionRate: number,
  reminderAckRate: number,
  habitStreakConsistency: number,
): ProductivityScore {
  const raw =
    taskCompletionRate     * WEIGHT_TASKS     +
    reminderAckRate        * WEIGHT_REMINDERS +
    habitStreakConsistency * WEIGHT_HABITS;

  const clamped = Math.min(1, Math.max(0, raw));
  const score = Math.round(clamped * 100 * 100) / 100; // 2 decimal places

  return {
    score,
    taskCompletionRate,
    reminderAckRate,
    habitStreakConsistency,
    computedAt: new Date().toISOString(),
  };
}
