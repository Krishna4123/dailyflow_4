/**
 * @file types.ts
 * TypeScript interfaces for the Task Board module.
 */

/** Workflow status of a task on the kanban board. */
export type TaskStatus = 'todo' | 'in_progress' | 'done';

/** Importance level of a task. */
export type TaskPriority = 'low' | 'medium' | 'high';

/** Area of life the task belongs to. */
export type TaskCategory = 'work' | 'personal' | 'health';

/**
 * A single task record as stored in (and returned from) the database.
 */
export interface Task {
  /** Auto-incremented primary key */
  id: number;
  /** FK → users.id */
  userId: number;
  /** Human-readable task title (required) */
  title: string;
  /** Current workflow status */
  status: TaskStatus;
  /** Importance level */
  priority: TaskPriority;
  /** Area of life */
  category: TaskCategory;
  /** Optional deadline in YYYY-MM-DD format */
  dueDate: string | null;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last-updated timestamp */
  updatedAt: string;
}

/**
 * Fields accepted when creating a new task.
 * `status` defaults to 'todo'; `priority` defaults to 'medium'; `category` defaults to 'work'.
 */
export interface CreateTaskInput {
  userId: number;
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string | null;
}

/**
 * Fields accepted when updating an existing task.
 * All fields are optional — only provided fields are changed.
 */
export interface UpdateTaskInput {
  title?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string | null;
}
