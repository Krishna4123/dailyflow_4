import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';

/**
 * Absolute path to the data directory.
 * Resolved from the process working directory so it always lands at
 * <repo-root>/data/db.sqlite regardless of where the process starts.
 */
const DB_DIR = process.env.DB_DIR ?? join(__dirname, '..', '..', 'data');

/** Absolute path to the SQLite file. Never hard-code this outside db.ts. */
export const DB_PATH = process.env.DB_PATH ?? join(DB_DIR, 'db.sqlite');

mkdirSync(DB_DIR, { recursive: true });

/**
 * Singleton better-sqlite3 database instance.
 * WAL mode is enabled for better concurrent read performance.
 * Foreign key enforcement is ON — all FK constraints are active.
 */
export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Runs all CREATE TABLE IF NOT EXISTS statements for every DailyFlow module.
 * Safe to call on every process start — fully idempotent.
 * Seeds a default user row (id=1) so every module has a valid userId from day one.
 *
 * @returns void
 */
export function initDb(): void {
  db.exec(`
    -- ── Users ──────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Tasks ───────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id),
      title       TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'todo'
                          CHECK(status IN ('todo','in_progress','done')),
      priority    TEXT    NOT NULL DEFAULT 'medium'
                          CHECK(priority IN ('low','medium','high')),
      category    TEXT    NOT NULL DEFAULT 'work'
                          CHECK(category IN ('work','personal','health')),
      due_date    TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Reminders ───────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS reminders (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL REFERENCES users(id),
      label           TEXT    NOT NULL,
      category        TEXT    NOT NULL DEFAULT 'work'
                              CHECK(category IN ('work','personal','health')),
      trigger_at      TEXT    NOT NULL,
      recurrence      TEXT             CHECK(recurrence IN ('daily','weekly') OR recurrence IS NULL),
      acknowledged_at TEXT,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Habits ──────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS habits (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id),
      name       TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Habit Logs ──────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS habit_logs (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id     INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      user_id      INTEGER NOT NULL REFERENCES users(id),
      completed_on TEXT    NOT NULL,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(habit_id, completed_on)
    );
  `);

  // Seed the single default user if not already present.
  const existing = db.prepare('SELECT id FROM users WHERE id = 1').get();
  if (!existing) {
    db.prepare("INSERT INTO users (id, name) VALUES (1, 'Default User')").run();
  }
}
