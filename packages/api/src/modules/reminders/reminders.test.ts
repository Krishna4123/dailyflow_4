/**
 * @file reminders.test.ts
 * Unit tests for the Reminder Engine service layer.
 * All tests are pure (no DB) — data is constructed inline.
 */

import { describe, it, expect } from 'vitest';
import { computeReminderAckRate, isValidRecurrence, isValidReminderCategory } from './service';
import type { Reminder } from './types';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Builds a minimal Reminder fixture for testing purposes.
 *
 * @param overrides - Partial Reminder fields to override
 * @returns A complete Reminder object
 */
function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: 1,
    userId: 1,
    label: 'Test reminder',
    category: 'work',
    triggerAt: new Date(Date.now() - 60_000).toISOString(), // 1 min ago → due
    recurrence: null,
    acknowledgedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── computeReminderAckRate ────────────────────────────────────────────────────

describe('computeReminderAckRate', () => {
  it('returns 0 when there are no due reminders', () => {
    expect(computeReminderAckRate([])).toBe(0);
  });

  it('returns 0 when no due reminders are acknowledged', () => {
    const reminders = [makeReminder(), makeReminder({ id: 2 })];
    expect(computeReminderAckRate(reminders)).toBe(0);
  });

  it('returns 1 when all due reminders are acknowledged', () => {
    const acked = makeReminder({ acknowledgedAt: new Date().toISOString() });
    expect(computeReminderAckRate([acked])).toBe(1);
  });

  it('returns the correct fraction for a mixed list', () => {
    const reminders = [
      makeReminder({ id: 1, acknowledgedAt: new Date().toISOString() }),
      makeReminder({ id: 2, acknowledgedAt: null }),
      makeReminder({ id: 3, acknowledgedAt: null }),
      makeReminder({ id: 4, acknowledgedAt: new Date().toISOString() }),
    ];
    expect(computeReminderAckRate(reminders)).toBeCloseTo(0.5);
  });

  it('never returns NaN', () => {
    expect(Number.isNaN(computeReminderAckRate([]))).toBe(false);
  });
});

// ── Validation helpers ────────────────────────────────────────────────────────

describe('isValidRecurrence', () => {
  it('accepts daily and weekly', () => {
    expect(isValidRecurrence('daily')).toBe(true);
    expect(isValidRecurrence('weekly')).toBe(true);
  });

  it('accepts null (one-off)', () => {
    expect(isValidRecurrence(null)).toBe(true);
  });

  it('rejects other strings', () => {
    expect(isValidRecurrence('monthly')).toBe(false);
    expect(isValidRecurrence('')).toBe(false);
  });
});

describe('isValidReminderCategory', () => {
  it('accepts all valid categories', () => {
    expect(isValidReminderCategory('work')).toBe(true);
    expect(isValidReminderCategory('personal')).toBe(true);
    expect(isValidReminderCategory('health')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidReminderCategory('finance')).toBe(false);
  });
});
