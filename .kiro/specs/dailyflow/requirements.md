# Requirements Document

## Introduction
DailyFlow is a personal productivity hub for a single user. It consists of four
modules — Task Board, Reminder Engine, Habit Tracker, and Productivity Score —
all operating against one shared User entity.

---

## Glossary

| Term | Definition |
|---|---|
| Task | A unit of work with a title, priority, category, status, and optional due date. |
| Reminder | A time-based notification with a label, trigger time, and optional recurrence. |
| Habit | A named daily behaviour the user wants to track consistently. |
| Habit Log | A single completion record for a habit on a specific calendar date. |
| Streak | The longest consecutive-day run of habit completions ending today. |
| Productivity Score | A composite 0–100 score derived from task completion, reminder acknowledgement, and habit streak consistency. |
| Acknowledge | The act of dismissing a reminder once it has fired, marking it as seen. |
| userId | The foreign key linking every data record to the single shared User entity. |

---

## Requirements

## User Stories

### Module 1 — Task Board

**US-1** As the user, I want to create a task with a title, priority
(low / medium / high), category (work / personal / health), and an optional due
date, so that I can track what I need to do.

**US-2** As the user, I want to move tasks between three columns — Todo,
In Progress, and Done — so that I have a clear kanban view of my work.

**US-3** As the user, I want to edit or delete any task at any time, so
that my board stays accurate as circumstances change.

### Module 2 — Reminder Engine

**US-4** As the user, I want to create a time-based reminder with a label,
category, trigger time, and optional recurrence (daily / weekly), so that I
never miss a commitment.

**US-5** As the user, I want to acknowledge (dismiss) a reminder when it
fires, so that the system records it as seen and factors it into my score.

### Module 3 — Habit Tracker

**US-6** As the user, I want to define a named daily habit, so that the
system tracks whether I complete it each day.

**US-7** As the user, I want to mark a habit as complete for today and see
my current consecutive-day streak, so that I stay motivated.

**US-8** As the user, I want to view a calendar heatmap of my habit
completions over time, so that I can spot patterns in my consistency.

### Module 4 — Productivity Score

**US-9** As the user, I want to see a real-time Productivity Score (0–100)
calculated as:

```
Score = (task_completion_rate  * 0.4)
      + (reminder_ack_rate     * 0.3)
      + (habit_streak_consistency * 0.3)
```

so that I have a single number reflecting my overall productivity.

**US-10** As the user, I want the score to update automatically whenever I
complete a task, acknowledge a reminder, or log a habit, so that feedback is
immediate.

### Cross-cutting

**US-11** As the user, I want to export all my data (tasks, reminders,
habits, score history) to a local JSON file, so that I own my data and can
back it up.

**US-12** As the user, I want every piece of data — tasks, reminders,
habits, score records — to be tied to my single user identity (userId), so
that the system always operates as a unified, coherent hub.

---

## Acceptance Criteria

### Task Board
- A task row must include: `id`, `userId`, `title`, `status` (todo | in_progress | done), `priority` (low | medium | high), `category` (work | personal | health), optional `dueDate`, `createdAt`, `updatedAt`.
- `task_completion_rate = done_tasks / total_tasks` (0 when no tasks exist).
- CRUD endpoints exist under `/api/v1/tasks`.

### Reminder Engine
- A reminder row must include: `id`, `userId`, `label`, `category`, `triggerAt` (ISO timestamp), optional `recurrence` (daily | weekly), `acknowledgedAt` (null until dismissed).
- `reminder_ack_rate = acknowledged_reminders / total_reminders_due` (0 when none due).
- CRUD + acknowledge endpoints exist under `/api/v1/reminders`.

### Habit Tracker
- A habit row must include: `id`, `userId`, `name`, `createdAt`.
- A habit-log row must include: `id`, `habitId`, `userId`, `completedOn` (YYYY-MM-DD), `createdAt`.
- Streak = longest consecutive-day run ending today.
- `habit_streak_consistency = current_streak / max(7, days_since_first_log)` clamped to [0, 1].
- CRUD + log endpoints exist under `/api/v1/habits`.
- Heatmap data endpoint: `GET /api/v1/habits/:id/heatmap`.

### Productivity Score
- `GET /api/v1/score` returns `{ data: ProductivityScore, error: null }`.
- Score weights are exactly 0.4 / 0.3 / 0.3 and must be enforced server-side.
- Score is a number in [0, 100].

### Data Export
- `GET /api/v1/export` returns a JSON file download containing all user data.

### Shared User Entity
- All module types (`Task`, `Reminder`, `Habit`, `HabitLog`) carry a `userId` field referencing the single `User` entity.
- No module defines its own independent user concept.
