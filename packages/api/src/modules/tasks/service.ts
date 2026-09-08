/**
 * @file service.ts
 * Pure business logic for the Task Board module.
 * No database calls — receives data from the repository layer.
 */

import type { Task } from './types';

/**
 * Computes the fraction of tasks that are in 'done' status.
 * Returns exactly 0 when the task list is empty (never NaN or Infinity).
 *
 * @param tasks - The full list of tasks to evaluate
 * @returns A number in [0, 1] representing the completion rate
 */
export function computeTaskCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return done / tasks.length;
}

/**
 * Validates that a task status value is one of the accepted enum members.
 *
 * @param value - The string to validate
 * @returns true if the value is a valid TaskStatus
 */
export function isValidTaskStatus(value: string): value is Task['status'] {
  return ['todo', 'in_progress', 'done'].includes(value);
}

/**
 * Validates that a task priority value is one of the accepted enum members.
 *
 * @param value - The string to validate
 * @returns true if the value is a valid TaskPriority
 */
export function isValidTaskPriority(value: string): value is Task['priority'] {
  return ['low', 'medium', 'high'].includes(value);
}

/**
 * Validates that a task category value is one of the accepted enum members.
 *
 * @param value - The string to validate
 * @returns true if the value is a valid TaskCategory
 */
export function isValidTaskCategory(value: string): value is Task['category'] {
  return ['work', 'personal', 'health'].includes(value);
}
