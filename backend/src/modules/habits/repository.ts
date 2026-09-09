/**
 * @file repository.ts
 * SQLite queries for the Habit Tracker module.
 * No business logic — pure data access only.
 */

import { db } from '../../db';
import type { Habit, HabitLog, HabitHeatmapEntry, CreateHabitInput } from './types';

// ── Row mappers ────────────────────────────────────────────────────────────────

/**
 * Maps a raw SQLite habits row to a Habit interface.
 *
 * @param row - Raw database row object
 * @returns Typed Habit instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToHabit(row: Record<string, any>): Habit {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    name: row.name as string,
    createdAt: row.created_at as string,
  };
}

/**
 * Maps a raw SQLite habit_logs row to a HabitLog interface.
 *
 * @param row - Raw database row object
 * @returns Typed HabitLog instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToHabitLog(row: Record<string, any>): HabitLog {
  return {
    id: row.id as number,
    habitId: row.habit_id as number,
    userId: row.user_id as number,
    completedOn: row.completed_on as string,
    createdAt: row.created_at as string,
  };
}

// ── Habit CRUD ─────────────────────────────────────────────────────────────────

/**
 * Returns all habits for a user, ordered by creation date ascending.
 *
 * @param userId - The user's primary key
 * @returns Array of Habit objects (may be empty)
 */
export function findAll(userId: number): Habit[] {
  const rows = db
    .prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC')
    .all(userId) as Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r) => rowToHabit(r as Record<string, any>));
}

/**
 * Returns a single habit by primary key, or null if not found.
 *
 * @param id - The habit's primary key
 * @param userId - The owning user's primary key
 * @returns The matching Habit, or null
 */
export function findById(id: number, userId: number): Habit | null {
  const row = db
    .prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?')
    .get(id, userId) as Record<string, unknown> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return row ? rowToHabit(row as Record<string, any>) : null;
}

/**
 * Inserts a new habit row and returns the created Habit.
 *
 * @param input - Fields for the new habit
 * @returns The newly created Habit with auto-assigned id and timestamp
 */
export function create(input: CreateHabitInput): Habit {
  const result = db
    .prepare('INSERT INTO habits (user_id, name) VALUES (@userId, @name)')
    .run({ userId: input.userId, name: input.name });

  return findById(result.lastInsertRowid as number, input.userId)!;
}

/**
 * Deletes a habit and all its logs (ON DELETE CASCADE handles logs).
 * Returns true if a row was deleted, false if not found.
 *
 * @param id - The habit's primary key
 * @param userId - The owning user's primary key
 * @returns Whether a row was actually deleted
 */
export function remove(id: number, userId: number): boolean {
  const result = db
    .prepare('DELETE FROM habits WHERE id = ? AND user_id = ?')
    .run(id, userId);
  return result.changes > 0;
}

// ── Habit Logs ────────────────────────────────────────────────────────────────

/**
 * Upserts a completion log for today for the given habit.
 * The UNIQUE(habit_id, completed_on) constraint prevents duplicates.
 * Uses INSERT OR IGNORE so a second call on the same day is a silent no-op.
 *
 * @param habitId - The habit's primary key
 * @param userId - The owning user's primary key
 * @param completedOn - Calendar date string in YYYY-MM-DD format
 * @returns The log entry (existing or newly created)
 * @throws Error if the habit does not exist
 */
export function logToday(habitId: number, userId: number, completedOn: string): HabitLog {
  db.prepare(`
    INSERT OR IGNORE INTO habit_logs (habit_id, user_id, completed_on)
    VALUES (?, ?, ?)
  `).run(habitId, userId, completedOn);

  const row = db
    .prepare('SELECT * FROM habit_logs WHERE habit_id = ? AND completed_on = ?')
    .get(habitId, completedOn) as Record<string, unknown>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rowToHabitLog(row as Record<string, any>);
}

/**
 * Returns all log entries for a specific habit, ordered by date ascending.
 *
 * @param habitId - The habit's primary key
 * @param userId - The owning user's primary key
 * @returns Array of HabitLog objects
 */
export function getLogsForHabit(habitId: number, userId: number): HabitLog[] {
  const rows = db
    .prepare('SELECT * FROM habit_logs WHERE habit_id = ? AND user_id = ? ORDER BY completed_on ASC')
    .all(habitId, userId) as Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r) => rowToHabitLog(r as Record<string, any>));
}

/**
 * Returns heatmap data for the last 365 days for a specific habit.
 * Each entry holds the date and the completion count (0 or 1 per habit).
 *
 * @param habitId - The habit's primary key
 * @param userId - The owning user's primary key
 * @returns Array of HabitHeatmapEntry objects covering the last 365 days
 */
export function getHeatmapData(habitId: number, userId: number): HabitHeatmapEntry[] {
  const rows = db.prepare(`
    SELECT completed_on AS date, COUNT(*) AS count
    FROM habit_logs
    WHERE habit_id = ?
      AND user_id  = ?
      AND completed_on >= date('now', '-364 days')
    GROUP BY completed_on
    ORDER BY completed_on ASC
  `).all(habitId, userId) as Array<{ date: string; count: number }>;

  return rows.map((r) => ({ date: r.date, count: r.count }));
}

/**
 * Returns all habit_logs rows for a user (used by the export endpoint).
 *
 * @param userId - The user's primary key
 * @returns Array of all HabitLog objects for this user
 */
export function findAllLogs(userId: number): HabitLog[] {
  const rows = db
    .prepare('SELECT * FROM habit_logs WHERE user_id = ? ORDER BY completed_on ASC')
    .all(userId) as Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r) => rowToHabitLog(r as Record<string, any>));
}
