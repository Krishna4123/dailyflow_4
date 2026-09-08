/**
 * Standalone database initialisation script.
 * Run via: npm run db:init (from repo root)
 *
 * Creates data/db.sqlite with all five DailyFlow tables and seeds the
 * default user row. Safe to re-run — all statements use IF NOT EXISTS.
 */
import { initDb, db, DB_PATH } from '../packages/api/src/db';

initDb();
db.close();

console.log(`✔  Database initialised at: ${DB_PATH}`);
console.log('   Tables: users, tasks, reminders, habits, habit_logs');
console.log('   Default user (id=1) seeded.');
