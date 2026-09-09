/**
 * @file shared.ts
 * Cross-cutting TypeScript types used by every DailyFlow module.
 * No module should define its own User concept — always reference this one.
 */

import type { Task } from '../modules/tasks/types';
import type { Reminder } from '../modules/reminders/types';
import type { Habit, HabitLog } from '../modules/habits/types';

// ── User ───────────────────────────────────────────────────────────────────────

/**
 * Core User entity shared across all DailyFlow modules.
 * All module entities (Task, Reminder, Habit, HabitLog) reference this via userId: number.
 * Never create a module-local user concept.
 */
export interface User {
  /** Auto-incremented primary key */
  id: number;
  /** Display name of the user */
  name: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
}

// ── API envelope ───────────────────────────────────────────────────────────────

/**
 * Standard API response envelope used by every DailyFlow endpoint.
 * On success: { data: T, error: null }
 * On failure: { data: null, error: string }
 * Never return HTTP 200 with a non-null error field.
 *
 * @template T - The type of the success payload
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ── Export payload ─────────────────────────────────────────────────────────────

/**
 * Full data export payload returned by GET /api/v1/export.
 * Contains every record belonging to the user — no pagination.
 */
export interface ExportPayload {
  /** ISO 8601 timestamp of when the export was generated */
  exportedAt: string;
  user: User;
  tasks: Task[];
  reminders: Reminder[];
  habits: Habit[];
  habitLogs: HabitLog[];
}

/**
 * Response body returned by POST /api/v1/export.
 * The file is written to ./exports/ via the MCP filesystem tool.
 */
export interface ExportFileResult {
  /** Relative path of the written file, e.g. "./exports/dailyflow-export-1234567890.json" */
  filePath: string;
  /** ISO 8601 timestamp matching the exportedAt field inside the file */
  exportedAt: string;
}
