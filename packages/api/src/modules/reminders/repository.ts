/**
 * @file repository.ts
 * SQLite queries for the Reminder Engine module.
 * No business logic — pure data access only.
 */

import { db } from '../../db';
import type { Reminder, CreateReminderInput, UpdateReminderInput } from './types';

// ── Row mapper ─────────────────────────────────────────────────────────────────

/**
 * Maps a raw SQLite row (snake_case) to a Reminder interface (camelCase).
 *
 * @param row - Raw database row object
 * @returns Typed Reminder instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToReminder(row: Record<string, any>): Reminder {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    label: row.label as string,
    category: row.category as Reminder['category'],
    triggerAt: row.trigger_at as string,
    recurrence: (row.recurrence as Reminder['recurrence']) ?? null,
    acknowledgedAt: (row.acknowledged_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Returns all reminders for a user, ordered by trigger time ascending.
 *
 * @param userId - The user's primary key
 * @returns Array of Reminder objects (may be empty)
 */
export function findAll(userId: number): Reminder[] {
  const rows = db
    .prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY trigger_at ASC')
    .all(userId) as Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r) => rowToReminder(r as Record<string, any>));
}

/**
 * Returns reminders whose trigger_at is in the past (i.e. have already fired).
 * Used to calculate the acknowledgement rate denominator.
 *
 * @param userId - The user's primary key
 * @returns Array of due Reminder objects
 */
export function findDue(userId: number): Reminder[] {
  const rows = db
    .prepare("SELECT * FROM reminders WHERE user_id = ? AND trigger_at <= datetime('now')")
    .all(userId) as Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r) => rowToReminder(r as Record<string, any>));
}

/**
 * Returns a single reminder by primary key, or null if not found.
 *
 * @param id - The reminder's primary key
 * @param userId - The owning user's primary key
 * @returns The matching Reminder, or null
 */
export function findById(id: number, userId: number): Reminder | null {
  const row = db
    .prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?')
    .get(id, userId) as Record<string, unknown> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return row ? rowToReminder(row as Record<string, any>) : null;
}

/**
 * Inserts a new reminder row and returns the created Reminder.
 *
 * @param input - Fields for the new reminder
 * @returns The newly created Reminder with auto-assigned id and timestamps
 */
export function create(input: CreateReminderInput): Reminder {
  const result = db.prepare(`
    INSERT INTO reminders (user_id, label, category, trigger_at, recurrence)
    VALUES (@userId, @label, @category, @triggerAt, @recurrence)
  `).run({
    userId: input.userId,
    label: input.label,
    category: input.category ?? 'work',
    triggerAt: input.triggerAt,
    recurrence: input.recurrence ?? null,
  });

  return findById(result.lastInsertRowid as number, input.userId)!;
}

/**
 * Updates one or more fields on an existing reminder.
 * Returns the updated Reminder, or null if not found.
 *
 * @param id - The reminder's primary key
 * @param userId - The owning user's primary key
 * @param input - Partial update fields
 * @returns The updated Reminder, or null
 */
export function update(id: number, userId: number, input: UpdateReminderInput): Reminder | null {
  const existing = findById(id, userId);
  if (!existing) return null;

  db.prepare(`
    UPDATE reminders
    SET label      = @label,
        category   = @category,
        trigger_at = @triggerAt,
        recurrence = @recurrence,
        updated_at = datetime('now')
    WHERE id = @id AND user_id = @userId
  `).run({
    id,
    userId,
    label: input.label ?? existing.label,
    category: input.category ?? existing.category,
    triggerAt: input.triggerAt ?? existing.triggerAt,
    recurrence: input.recurrence !== undefined ? input.recurrence : existing.recurrence,
  });

  return findById(id, userId);
}

/**
 * Sets acknowledged_at to the current UTC timestamp.
 * Idempotent — calling it on an already-acknowledged reminder is a no-op.
 * Returns the reminder after the operation, or null if not found.
 *
 * @param id - The reminder's primary key
 * @param userId - The owning user's primary key
 * @returns The (possibly unchanged) Reminder, or null
 */
export function acknowledge(id: number, userId: number): Reminder | null {
  const existing = findById(id, userId);
  if (!existing) return null;

  // Already acknowledged — return unchanged (idempotent)
  if (existing.acknowledgedAt !== null) return existing;

  db.prepare(`
    UPDATE reminders
    SET acknowledged_at = datetime('now'),
        updated_at      = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(id, userId);

  return findById(id, userId);
}

/**
 * Deletes a reminder by primary key.
 * Returns true if a row was deleted, false if not found.
 *
 * @param id - The reminder's primary key
 * @param userId - The owning user's primary key
 * @returns Whether a row was actually deleted
 */
export function remove(id: number, userId: number): boolean {
  const result = db
    .prepare('DELETE FROM reminders WHERE id = ? AND user_id = ?')
    .run(id, userId);
  return result.changes > 0;
}
