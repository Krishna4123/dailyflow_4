# Design — DailyFlow

## Overview

DailyFlow is a single-user personal productivity hub. Three data modules — **Tasks**, **Reminders**, and **Habits** — feed a single **Productivity Score** that reflects daily progress across all three areas. A fourth cross-cutting concern provides **Data Export** so the user can download everything as a local JSON file.

The system is a monorepo split into two packages:

- `packages/api` — REST API (Node.js 20 / TypeScript 5 strict / Express 4)
- `packages/web` — SPA frontend (React 18 / TypeScript 5 strict / Vite 5)

All API routes are prefixed `/api/v1/<resource>`.  
All responses follow the envelope `{ data: T, error: string | null }`.  
The single SQLite database lives at `data/db.sqlite` (via `better-sqlite3`).

---

## Architecture

Monorepo with two packages:

- `packages/api` — Node.js 20 / TypeScript 5 / Express 4 backend
- `packages/web` — React 18 / TypeScript 5 / Vite 5 frontend

Database: SQLite via `better-sqlite3`, stored at `data/db.sqlite`.  
All API routes are prefixed `/api/v1/<resource>`.  
All responses follow the shape `{ data: T, error: string | null }`.

### Module File Structure (per module, api side)

```
packages/api/src/modules/<module>/
  router.ts          Express route definitions
  service.ts         Business logic (pure, no DB calls)
  repository.ts      SQLite queries via better-sqlite3
  types.ts           TypeScript interfaces for this module
  <module>.test.ts   Co-located Vitest tests
```

### Frontend Component Tree

```
App
├── ScoreWidget          (live ProductivityScore display)
├── TaskBoard            (kanban columns: Todo / In Progress / Done)
│   ├── TaskColumn
│   └── TaskCard
├── ReminderList         (upcoming reminders, acknowledge button)
│   └── ReminderItem
├── HabitTracker
│   ├── HabitList
│   │   └── HabitRow    (name, today checkbox, streak count)
│   └── HabitHeatmap    (calendar heatmap)
└── ExportButton         (triggers GET /api/v1/export download)
```

State is managed via React Context + useReducer. No Redux, no Zustand.  
Styling via CSS Modules only — no Tailwind, no CSS-in-JS.

---

## Components and Interfaces

### Module 1 — Task Board

#### Endpoints

| Method | Path              | Description                                            |
|--------|-------------------|--------------------------------------------------------|
| GET    | /api/v1/tasks     | List all tasks                                         |
| POST   | /api/v1/tasks     | Create a task                                          |
| PATCH  | /api/v1/tasks/:id | Update title / status / priority / category / dueDate |
| DELETE | /api/v1/tasks/:id | Delete a task                                          |

#### Derived Metric

```
task_completion_rate = done_count / total_count   (0 if total_count === 0)
```

---

### Module 2 — Reminder Engine

#### Endpoints

| Method | Path                              | Description                           |
|--------|-----------------------------------|---------------------------------------|
| GET    | /api/v1/reminders                 | List all reminders                    |
| POST   | /api/v1/reminders                 | Create a reminder                     |
| PATCH  | /api/v1/reminders/:id             | Update label / triggerAt / recurrence |
| POST   | /api/v1/reminders/:id/acknowledge | Acknowledge (dismiss) a reminder      |
| DELETE | /api/v1/reminders/:id             | Delete a reminder                     |

#### Derived Metric

```
reminder_ack_rate = acknowledged_count / due_count   (0 if due_count === 0)
due = reminders whose triggerAt <= now
```

---

### Module 3 — Habit Tracker

#### Endpoints

| Method | Path                       | Description                            |
|--------|----------------------------|----------------------------------------|
| GET    | /api/v1/habits             | List all habits                        |
| POST   | /api/v1/habits             | Create a habit                         |
| DELETE | /api/v1/habits/:id         | Delete a habit and its logs            |
| POST   | /api/v1/habits/:id/log     | Log completion for today               |
| GET    | /api/v1/habits/:id/heatmap | Return heatmap entries (last 365 days) |

#### Streak Algorithm

```
streak = number of consecutive days ending on today where
         at least one habit was logged per day
```

#### Derived Metric

```
habit_streak_consistency = current_streak / max(7, days_since_first_log)
                           clamped to [0, 1]
```

---

### Module 4 — Productivity Score

#### Endpoints

| Method | Path          | Description                          |
|--------|---------------|--------------------------------------|
| GET    | /api/v1/score | Compute and return ProductivityScore |

#### Formula (enforced server-side)

```
score = (taskCompletionRate     * 0.4
       + reminderAckRate        * 0.3
       + habitStreakConsistency * 0.3) * 100
```

---

### Data Export

#### Endpoint

| Method | Path           | Description                                      |
|--------|----------------|--------------------------------------------------|
| GET    | /api/v1/export | Download all user data as a JSON file attachment |

---

## Data Models

### Shared TypeScript Interfaces

#### User

```typescript
interface User {
  id: number;
  name: string;
  createdAt: string; // ISO 8601
}
```

All module entities reference `userId: number` pointing to `User.id`.  
No module defines its own user concept.

---

### Module Types

#### Task Board

```typescript
type TaskStatus   = 'todo' | 'in_progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskCategory = 'work' | 'personal' | 'health';

interface Task {
  id: number;
  userId: number;       // FK → User.id
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string | null; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
```

#### Reminder Engine

```typescript
type ReminderCategory   = 'work' | 'personal' | 'health';
type ReminderRecurrence = 'daily' | 'weekly' | null;

interface Reminder {
  id: number;
  userId: number;            // FK → User.id
  label: string;
  category: ReminderCategory;
  triggerAt: string;         // ISO 8601
  recurrence: ReminderRecurrence;
  acknowledgedAt: string | null; // ISO 8601, null until dismissed
  createdAt: string;
  updatedAt: string;
}
```

#### Habit Tracker

```typescript
interface Habit {
  id: number;
  userId: number;   // FK → User.id
  name: string;
  createdAt: string;
}

interface HabitLog {
  id: number;
  habitId: number;  // FK → Habit.id
  userId: number;   // FK → User.id
  completedOn: string; // YYYY-MM-DD
  createdAt: string;
}

interface HabitHeatmapEntry {
  date: string;  // YYYY-MM-DD
  count: number; // number of habits completed that day
}
```

#### Productivity Score

```typescript
interface ProductivityScore {
  score: number;                  // 0–100, rounded to 2 decimal places
  taskCompletionRate: number;     // 0–1
  reminderAckRate: number;        // 0–1
  habitStreakConsistency: number; // 0–1
  computedAt: string;             // ISO 8601
}
```

#### Data Export

```typescript
interface ExportPayload {
  exportedAt: string;
  user: User;
  tasks: Task[];
  reminders: Reminder[];
  habits: Habit[];
  habitLogs: HabitLog[];
}
```

---

### Database Schema

```sql
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'todo',
  priority    TEXT NOT NULL DEFAULT 'medium',
  category    TEXT NOT NULL DEFAULT 'work',
  due_date    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE reminders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  label           TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'work',
  trigger_at      TEXT NOT NULL,
  recurrence      TEXT,
  acknowledged_at TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE habits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE habit_logs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id     INTEGER NOT NULL REFERENCES habits(id),
  user_id      INTEGER NOT NULL REFERENCES users(id),
  completed_on TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(habit_id, completed_on)
);
```

---

## Correctness Properties

These invariants must hold at all times and are enforced in service/repository layers:

1. **Single-user constraint** — Every entity row carries a `user_id` FK to `users.id`. No module exposes data without scoping to the authenticated user.
2. **Task completion rate bounds** — `task_completion_rate` is always in `[0, 1]`. When `total_count === 0` the value is exactly `0`, never `NaN` or `Infinity`.
3. **Reminder acknowledgement is one-way** — Once `acknowledgedAt` is set it cannot be cleared via the API. Re-acknowledging an already-acknowledged reminder is a no-op (returns the unchanged record).
4. **Habit log uniqueness** — The `UNIQUE(habit_id, completed_on)` constraint in SQLite is the source of truth. The service layer must surface a clear conflict error rather than swallowing the constraint violation.
5. **Streak consistency bounds** — `habit_streak_consistency` is clamped to `[0, 1]` before the score calculation, regardless of edge-case inputs.
6. **Productivity Score formula fidelity** — The weights `0.4 / 0.3 / 0.3` always sum to `1.0`. The final score is rounded to exactly 2 decimal places and is always in `[0, 100]`.
7. **Export completeness** — The export endpoint returns all records for the user with no pagination; it is a full snapshot.

---

## Error Handling

All route handlers follow a consistent error response strategy using the `{ data: null, error: string }` envelope.

| Situation                              | HTTP Status | `error` value                        |
|----------------------------------------|-------------|--------------------------------------|
| Requested resource not found           | 404         | `"Not found"`                        |
| Validation failure (missing/bad field) | 400         | Descriptive message, e.g. `"title is required"` |
| Duplicate habit log for the same day   | 409         | `"Habit already logged for this date"` |
| Acknowledging a non-existent reminder  | 404         | `"Not found"`                        |
| Unexpected server / DB error           | 500         | `"Internal server error"`            |

**Principles:**
- Never return HTTP 200 with a non-null `error` field.
- Service functions throw typed errors; routers catch and map to HTTP status codes.
- SQLite constraint violations (UNIQUE, FK) are caught in the repository layer and re-thrown as domain errors so the service remains pure.
- The export endpoint returns 500 only if the DB read itself fails; an empty dataset is a valid 200 response.

---

## Testing Strategy

Tests are co-located with each module at `packages/api/src/modules/<module>/<module>.test.ts` and run with **Vitest**.

### Unit tests (service.ts)

Service functions are pure (no DB calls), so they can be tested with plain inputs:

- Task: `computeCompletionRate` — boundary cases: 0 tasks, all done, none done.
- Reminder: `computeAckRate` — boundary cases: no due reminders, all acknowledged.
- Habit: `computeStreak` — consecutive days, gap in the middle, single-day streak, zero logs.
- Habit: `computeStreakConsistency` — clamp behaviour at 0 and 1.
- Score: `computeProductivityScore` — verify formula weights and rounding.

### Integration tests (router.ts + repository.ts)

Use an **in-memory SQLite database** (`:memory:`) seeded in `beforeEach` so every test starts clean:

- CRUD happy paths for each module.
- 404 on unknown IDs.
- 400 on missing required fields.
- 409 on duplicate habit log.
- Acknowledge endpoint: idempotency check.
- Score endpoint: confirm computed values match manual formula application.
- Export endpoint: verify all tables are represented in the payload.

### Frontend

Component tests live alongside their component files using **Vitest + React Testing Library**:

- `TaskBoard` — renders columns, adds a card, moves a card between columns.
- `ReminderList` — renders items, clicking Acknowledge fires the correct API call.
- `HabitTracker` — checkbox toggles log, streak counter updates.
- `ScoreWidget` — displays formatted score from context.
