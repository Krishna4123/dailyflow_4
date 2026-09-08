# Implementation Plan

## Overview

DailyFlow is a single-user personal productivity hub built as a Node.js/Express API backed by SQLite and a React/Vite frontend. Implementation is broken into 16 tasks organised in dependency order: foundation first, then three data-module pairs (backend + frontend), the cross-cutting Productivity Score, data export, and a final integration pass. Each backend task must pass `tsc --noEmit` and its co-located Vitest suite before the paired frontend task begins.

## Tasks

### Foundation

#### TASK-1 — Project scaffold & database initialisation
Set up the monorepo structure (`packages/api`, `packages/web`), install all
dependencies, configure TypeScript strict mode, and create the SQLite
database initialisation script that runs all `CREATE TABLE` statements from
the design (users, tasks, reminders, habits, habit_logs). Seed a default
user row so every module has a valid `userId` from the start.

**Acceptance criteria**
- `packages/api` and `packages/web` each have their own `package.json` and `tsconfig.json`.
- Running `npm run db:init` from the repo root creates `data/db.sqlite` with all five tables.
- TypeScript compiles with zero errors under `strict: true`.

---

#### TASK-2 — Shared API response wrapper & error middleware
Implement the `{ data: T, error: string | null }` response helper used by
every route handler, and an Express error-handling middleware that catches
thrown errors and formats them with the same wrapper.

**Acceptance criteria**
- A `sendSuccess<T>(res, data)` and `sendError(res, status, message)` utility exist in `packages/api/src/utils/response.ts`.
- Unhandled throws in any route handler are caught and returned as `{ data: null, error: "..." }`.

---

### Module 1 — Task Board (backend)

#### TASK-3 — Task repository & service
Implement `packages/api/src/modules/tasks/repository.ts` with SQLite queries
for `findAll`, `findById`, `create`, `update`, and `remove`. Implement
`packages/api/src/modules/tasks/service.ts` with pure business logic
including `computeTaskCompletionRate`.

**Acceptance criteria**
- All functions have JSDoc `@param` / `@returns` tags and explicit return types.
- `computeTaskCompletionRate` returns `0` when no tasks exist.
- Co-located Vitest tests in `tasks.test.ts` cover completion rate logic.

---

#### TASK-4 — Task router
Wire up `packages/api/src/modules/tasks/router.ts` with four endpoints:
`GET /api/v1/tasks`, `POST /api/v1/tasks`, `PATCH /api/v1/tasks/:id`,
`DELETE /api/v1/tasks/:id`. Validate required fields; return `400` on
missing `title`.

**Acceptance criteria**
- All four endpoints respond with `{ data: T, error: null }` on success.
- `POST` without `title` returns `{ data: null, error: "title is required" }` with HTTP 400.
- Status transitions are accepted only for valid enum values.

---

### Module 1 — Task Board (frontend)

#### TASK-5 — TaskBoard UI component
Build `packages/web/src/features/tasks/components/TaskBoard.tsx` with three
kanban columns (Todo / In Progress / Done). Each `TaskCard` displays title,
priority badge, category, and optional due date. Implement drag-free
status changes via a dropdown or button on each card.

**Acceptance criteria**
- Tasks are fetched from `GET /api/v1/tasks` on mount.
- Changing a task's status calls `PATCH /api/v1/tasks/:id`.
- Styled exclusively with CSS Modules (no inline styles, no Tailwind).
- New-task form validates title is non-empty before submitting.

---

### Module 2 — Reminder Engine (backend)

#### TASK-6 — Reminder repository & service
Implement `repository.ts` with queries for `findAll`, `findDue`, `create`,
`update`, `acknowledge`, and `remove`. Implement `service.ts` with
`computeReminderAckRate` (acknowledged / due, 0 if none due).

**Acceptance criteria**
- `findDue` returns only reminders where `trigger_at <= now`.
- `acknowledge` sets `acknowledged_at` to the current ISO timestamp.
- All functions have explicit return types and JSDoc tags.
- `reminders.test.ts` covers `computeReminderAckRate`.

---

#### TASK-7 — Reminder router
Wire up `packages/api/src/modules/reminders/router.ts`:
`GET /api/v1/reminders`, `POST /api/v1/reminders`,
`PATCH /api/v1/reminders/:id`,
`POST /api/v1/reminders/:id/acknowledge`,
`DELETE /api/v1/reminders/:id`.

**Acceptance criteria**
- Acknowledge endpoint is idempotent (acknowledging twice does not error).
- Invalid `recurrence` value returns HTTP 400.
- All responses match `{ data: T, error: string | null }`.

---

### Module 2 — Reminder Engine (frontend)

#### TASK-8 — ReminderList UI component
Build `packages/web/src/features/reminders/components/ReminderList.tsx`
showing upcoming reminders sorted by `triggerAt`. Each `ReminderItem` has
an Acknowledge button that calls `POST /api/v1/reminders/:id/acknowledge`
and visually marks the reminder as done.

**Acceptance criteria**
- Acknowledged reminders are visually distinguished (e.g. greyed out / strikethrough).
- New-reminder form accepts label, category, triggerAt (datetime-local input), and optional recurrence.
- Component styled with CSS Modules.

---

### Module 3 — Habit Tracker (backend)

#### TASK-9 — Habit repository & service
Implement `repository.ts` with `findAll`, `create`, `remove`, `logToday`
(upsert on `UNIQUE(habit_id, completed_on)`), `getLogsForHabit`, and
`getHeatmapData` (last 365 days, grouped by date).
Implement `service.ts` with `computeStreak` and
`computeHabitStreakConsistency`.

**Acceptance criteria**
- `computeStreak` counts consecutive days ending today with ≥1 log.
- `computeHabitStreakConsistency` clamps output to [0, 1].
- Logging the same habit twice on the same day does not create a duplicate row.
- `habits.test.ts` covers streak calculation edge cases (0 logs, 1 day, gap in middle).

---

#### TASK-10 — Habit router
Wire up `packages/api/src/modules/habits/router.ts`:
`GET /api/v1/habits`, `POST /api/v1/habits`, `DELETE /api/v1/habits/:id`,
`POST /api/v1/habits/:id/log`, `GET /api/v1/habits/:id/heatmap`.

**Acceptance criteria**
- `GET /api/v1/habits/:id/heatmap` returns an array of `{ date, count }` objects for the last 365 days.
- Deleting a habit also deletes all its logs (CASCADE or explicit delete).
- All responses match the standard wrapper shape.

---

### Module 3 — Habit Tracker (frontend)

#### TASK-11 — HabitTracker UI with heatmap
Build `packages/web/src/features/habits/components/HabitTracker.tsx`
containing a `HabitList` (each row has habit name, today's completion
checkbox, and current streak count) and a `HabitHeatmap` calendar grid
(52 weeks × 7 days) coloured by completion count.

**Acceptance criteria**
- Checking the checkbox calls `POST /api/v1/habits/:id/log`.
- Heatmap fetches data from `GET /api/v1/habits/:id/heatmap` per habit (or an aggregate endpoint).
- Streak count updates immediately after logging (optimistic or refetch).
- Styled with CSS Modules only.

---

### Module 4 — Productivity Score

#### TASK-12 — Score service & router
Implement `packages/api/src/modules/score/service.ts` with
`computeProductivityScore` that pulls the three sub-rates and applies the
formula `(rate_t * 0.4 + rate_r * 0.3 + rate_h * 0.3) * 100`.
Wire up `GET /api/v1/score` in `router.ts`.

**Acceptance criteria**
- Weights are hard-coded constants `0.4`, `0.3`, `0.3` — not configurable.
- Score is clamped to [0, 100] and rounded to 2 decimal places.
- `score.test.ts` asserts the formula with known inputs.
- `GET /api/v1/score` returns `{ data: ProductivityScore, error: null }`.

---

#### TASK-13 — ScoreWidget UI component
Build `packages/web/src/features/score/components/ScoreWidget.tsx` that
polls `GET /api/v1/score` every 30 seconds and displays the overall score
plus the three contributing rates as a breakdown.

**Acceptance criteria**
- Score is displayed as a large number (0–100).
- Sub-rates are shown as percentages with their labels.
- Component re-fetches automatically after any task, reminder, or habit
  action (via Context event or manual trigger from parent).
- Styled with CSS Modules.

---

### Data Export

#### TASK-14 — Export router & download handler
Implement `packages/api/src/modules/export/router.ts` for
`GET /api/v1/export`. Query all tables for the current user, assemble an
`ExportPayload` object, and respond with
`Content-Disposition: attachment; filename="dailyflow-export.json"`.

**Acceptance criteria**
- Response body is valid JSON matching the `ExportPayload` shape.
- `Content-Type` header is `application/json`.
- `Content-Disposition` header triggers a file download.
- Export includes users, tasks, reminders, habits, and habit_logs.

---

#### TASK-15 — ExportButton UI component
Add an `ExportButton` component to the main `App` layout that triggers a
browser download by navigating to `GET /api/v1/export`.

**Acceptance criteria**
- Clicking the button downloads a file named `dailyflow-export.json`.
- Button is accessible (keyboard focusable, has an `aria-label`).
- Styled with CSS Modules.

---

### Integration & Polish

#### TASK-16 — Wire all routers into Express app & smoke test
Register all five module routers in `packages/api/src/app.ts` under
`/api/v1`. Add a `GET /api/v1/health` endpoint returning
`{ data: { status: "ok" }, error: null }`. Confirm the full app boots
without errors and all routes resolve.

**Acceptance criteria**
- `GET /api/v1/health` returns HTTP 200 with `{ data: { status: "ok" }, error: null }`.
- All `/api/v1/*` routes are reachable (no 404s from missing router registration).
- TypeScript build (`tsc --noEmit`) passes with zero errors across both packages.

---

## Task Dependency Graph

```
TASK-1 (scaffold & DB)
  └── TASK-2 (response wrapper)
        ├── TASK-3 (tasks repo & service)
        │     └── TASK-4 (tasks router)
        │           └── TASK-5 (TaskBoard UI)
        │                 └── TASK-16 (wire-up & smoke test)
        ├── TASK-6 (reminders repo & service)
        │     └── TASK-7 (reminders router)
        │           └── TASK-8 (ReminderList UI)
        │                 └── TASK-16
        ├── TASK-9 (habits repo & service)
        │     └── TASK-10 (habits router)
        │           └── TASK-11 (HabitTracker UI)
        │                 └── TASK-16
        ├── TASK-12 (score service & router) ← depends on TASK-3, TASK-6, TASK-9
        │     └── TASK-13 (ScoreWidget UI)
        │           └── TASK-16
        └── TASK-14 (export router) ← depends on TASK-3, TASK-6, TASK-9
              └── TASK-15 (ExportButton UI)
                    └── TASK-16
```

**Sequential build order:** 1 → 2 → 3 → 4 → 6 → 7 → 9 → 10 → 12 → 14 → 5 → 8 → 11 → 13 → 15 → 16

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["TASK-1"],
      "description": "Project scaffold and database initialisation — no dependencies"
    },
    {
      "wave": 2,
      "tasks": ["TASK-2"],
      "description": "Shared response wrapper and error middleware — depends on TASK-1"
    },
    {
      "wave": 3,
      "tasks": ["TASK-3", "TASK-6", "TASK-9"],
      "description": "All three module repositories and services — each depends on TASK-2; can run in parallel"
    },
    {
      "wave": 4,
      "tasks": ["TASK-4", "TASK-7", "TASK-10"],
      "description": "Module routers — depend on their paired repo/service (TASK-3, TASK-6, TASK-9 respectively); can run in parallel"
    },
    {
      "wave": 5,
      "tasks": ["TASK-12", "TASK-14"],
      "description": "Score service/router and export router — both depend on TASK-3, TASK-6, and TASK-9; can run in parallel"
    },
    {
      "wave": 6,
      "tasks": ["TASK-5", "TASK-8", "TASK-11", "TASK-13", "TASK-15"],
      "description": "All frontend components — depend on their paired backend router; can run in parallel"
    },
    {
      "wave": 7,
      "tasks": ["TASK-16"],
      "description": "Wire all routers and smoke test — depends on all previous tasks"
    }
  ]
}
```

## Notes

- TASK-12 (score) and TASK-14 (export) both read from the tasks, reminders, and habits repositories, so they must start after TASK-3, TASK-6, and TASK-9 are complete.
- Frontend tasks (5, 8, 11, 13, 15) can be developed in parallel once their paired backend router is done.
- All API routes must use the `sendSuccess` / `sendError` helpers from TASK-2 — no raw `res.json()` calls.
- The SQLite file lives at `data/db.sqlite`; this path must never be hard-coded outside `packages/api/src/db.ts`.
- CSS Modules are the only permitted styling mechanism across the entire frontend — no Tailwind, no CSS-in-JS, no inline `style` props.
- Vitest test files are co-located with their module (`*.test.ts` inside the module folder), not in a top-level `__tests__` directory.
