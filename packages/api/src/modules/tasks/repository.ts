/**
 * @file repository.ts
 * SQLite queries for the Task Board module.
 * All functions operate directly on the better-sqlite3 `db` instance.
 * No business logic lives here — pure data access only.
 */

import { db } from '../../db';
import type { Task, CreateTaskInput, UpdateTaskInput } from './types';

// ── Row mapper ─────────────────────────────────────────────────────────────────

/**
 * Maps a raw SQLite row (snake_case columns) to a Task interface (camelCase).
 *
 * @param row - Raw database row object
 * @returns Typed Task instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTask(row: Record<string, any>): Task {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    title: row.title as string,
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    category: row.category as Task['category'],
    dueDate: (row.due_date as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Returns all tasks belonging to the given user, ordered by creation date descending.
 *
 * @param userId - The user's primary key
 * @returns Array of Task objects (may be empty)
 */
export function findAll(userId: number): Task[] {
  const rows = db
    .prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r) => rowToTask(r as Record<string, any>));
}

/**
 * Returns a single task by its primary key, or null if not found.
 *
 * @param id - The task's primary key
 * @param userId - The owning user's primary key (scopes the query)
 * @returns The matching Task, or null
 */
export function findById(id: number, userId: number): Task | null {
  const row = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(id, userId) as Record<string, unknown> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return row ? rowToTask(row as Record<string, any>) : null;
}

/**
 * Inserts a new task row and returns the created Task.
 *
 * @param input - Fields for the new task
 * @returns The newly created Task with auto-assigned id and timestamps
 */
export function create(input: CreateTaskInput): Task {
  const stmt = db.prepare(`
    INSERT INTO tasks (user_id, title, status, priority, category, due_date)
    VALUES (@userId, @title, @status, @priority, @category, @dueDate)
  `);

  const result = stmt.run({
    userId: input.userId,
    title: input.title,
    status: input.status ?? 'todo',
    priority: input.priority ?? 'medium',
    category: input.category ?? 'work',
    dueDate: input.dueDate ?? null,
  });

  // Safe non-null assertion: INSERT always produces a lastInsertRowid.
  return findById(result.lastInsertRowid as number, input.userId)!;
}

/**
 * Updates one or more fields on an existing task and refreshes updated_at.
 * Returns the updated Task, or null if the task was not found.
 *
 * @param id - The task's primary key
 * @param userId - The owning user's primary key
 * @param input - Partial update fields
 * @returns The updated Task, or null
 */
export function update(id: number, userId: number, input: UpdateTaskInput): Task | null {
  const existing = findById(id, userId);
  if (!existing) return null;

  db.prepare(`
    UPDATE tasks
    SET title      = @title,
        status     = @status,
        priority   = @priority,
        category   = @category,
        due_date   = @dueDate,
        updated_at = datetime('now')
    WHERE id = @id AND user_id = @userId
  `).run({
    id,
    userId,
    title: input.title ?? existing.title,
    status: input.status ?? existing.status,
    priority: input.priority ?? existing.priority,
    category: input.category ?? existing.category,
    dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
  });

  return findById(id, userId);
}

/**
 * Deletes a task by primary key.
 * Returns true if a row was deleted, false if the task was not found.
 *
 * @param id - The task's primary key
 * @param userId - The owning user's primary key
 * @returns Whether a row was actually deleted
 */
export function remove(id: number, userId: number): boolean {
  const result = db
    .prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
    .run(id, userId);
  return result.changes > 0;
}
