/**
 * @file types.ts
 * TypeScript interfaces for the Productivity Score module.
 */

/**
 * The computed productivity score returned by GET /api/v1/score.
 */
export interface ProductivityScore {
  /**
   * Composite score in [0, 100], rounded to 2 decimal places.
   * Formula: (taskCompletionRate * 0.4 + reminderAckRate * 0.3 + habitStreakConsistency * 0.3) * 100
   */
  score: number;
  /** Fraction of tasks in 'done' status — in [0, 1] */
  taskCompletionRate: number;
  /** Fraction of due reminders that have been acknowledged — in [0, 1] */
  reminderAckRate: number;
  /** Habit streak consistency ratio — in [0, 1] */
  habitStreakConsistency: number;
  /** ISO 8601 timestamp of when this score was computed */
  computedAt: string;
}
