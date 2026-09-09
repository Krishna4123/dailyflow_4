/**
 * @file tasks.test.ts
 * Unit tests for the Task Board service layer.
 * All tests are pure (no DB) — data is constructed inline.
 */

import { describe, it, expect } from 'vitest';
import { computeTaskCompletionRate, isValidTaskStatus, isValidTaskPriority, isValidTaskCategory } from './service';
import type { Task } from './types';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Builds a minimal Task fixture for testing purposes.
 *
 * @param overrides - Partial Task fields to override
 * @returns A complete Task object
 */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    userId: 1,
    title: 'Test task',
    status: 'todo',
    priority: 'medium',
    category: 'work',
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── computeTaskCompletionRate ─────────────────────────────────────────────────

describe('computeTaskCompletionRate', () => {
  it('returns 0 when the task list is empty', () => {
    expect(computeTaskCompletionRate([])).toBe(0);
  });

  it('returns 0 when no tasks are done', () => {
    const tasks = [makeTask({ status: 'todo' }), makeTask({ status: 'in_progress' })];
    expect(computeTaskCompletionRate(tasks)).toBe(0);
  });

  it('returns 1 when all tasks are done', () => {
    const tasks = [makeTask({ status: 'done' }), makeTask({ status: 'done' })];
    expect(computeTaskCompletionRate(tasks)).toBe(1);
  });

  it('returns the correct fraction for a mixed list', () => {
    const tasks = [
      makeTask({ status: 'done' }),
      makeTask({ status: 'done' }),
      makeTask({ status: 'todo' }),
      makeTask({ status: 'in_progress' }),
    ];
    expect(computeTaskCompletionRate(tasks)).toBeCloseTo(0.5);
  });

  it('never returns NaN', () => {
    expect(Number.isNaN(computeTaskCompletionRate([]))).toBe(false);
  });
});

// ── Validation helpers ────────────────────────────────────────────────────────

describe('isValidTaskStatus', () => {
  it('accepts all valid statuses', () => {
    expect(isValidTaskStatus('todo')).toBe(true);
    expect(isValidTaskStatus('in_progress')).toBe(true);
    expect(isValidTaskStatus('done')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidTaskStatus('pending')).toBe(false);
    expect(isValidTaskStatus('')).toBe(false);
  });
});

describe('isValidTaskPriority', () => {
  it('accepts all valid priorities', () => {
    expect(isValidTaskPriority('low')).toBe(true);
    expect(isValidTaskPriority('medium')).toBe(true);
    expect(isValidTaskPriority('high')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidTaskPriority('critical')).toBe(false);
  });
});

describe('isValidTaskCategory', () => {
  it('accepts all valid categories', () => {
    expect(isValidTaskCategory('work')).toBe(true);
    expect(isValidTaskCategory('personal')).toBe(true);
    expect(isValidTaskCategory('health')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidTaskCategory('finance')).toBe(false);
  });
});
