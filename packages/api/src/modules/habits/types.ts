/**
 * @file types.ts
 * TypeScript interfaces for the Habit Tracker module.
 */

/**
 * A habit definition — what the user wants to track daily.
 */
export interface Habit {
  /** Auto-incremented primary key */
  id: number;
  /** FK → users.id */
  userId: number;
  /** Human-readable habit name */
  name: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
}

/**
 * A single completion entry: the habit was done on this calendar date.
 */
export interface HabitLog {
  /** Auto-incremented primary key */
  id: number;
  /** FK → habits.id */
  habitId: number;
  /** FK → users.id */
  userId: number;
  /** Calendar date of completion in YYYY-MM-DD format */
  completedOn: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
}

/**
 * One cell in the habit heatmap calendar grid.
 */
export interface HabitHeatmapEntry {
  /** Calendar date in YYYY-MM-DD format */
  date: string;
  /** Number of habits completed on that date */
  count: number;
}

/**
 * Fields accepted when creating a new habit.
 */
export interface CreateHabitInput {
  userId: number;
  name: string;
}
