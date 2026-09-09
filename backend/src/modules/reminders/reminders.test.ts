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

// ── Edge cases: recurring reminders ──────────────────────────────────────────

describe('computeReminderAckRate — recurring reminders', () => {
  it('counts a recurring daily reminder with no end date as due when triggerAt is in the past', () => {
    // A daily recurring reminder whose triggerAt is in the past is still a
    // due reminder — recurrence does not exempt it from the ack rate.
    const recurring = makeReminder({
      recurrence: 'daily',
      triggerAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      acknowledgedAt: null,
    });
    expect(computeReminderAckRate([recurring])).toBe(0);
  });

  it('counts a recurring weekly reminder as acknowledged when acknowledgedAt is set', () => {
    const recurring = makeReminder({
      recurrence: 'weekly',
      triggerAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      acknowledgedAt: new Date().toISOString(),
    });
    expect(computeReminderAckRate([recurring])).toBe(1);
  });

  it('handles a mix of recurring and one-off reminders correctly', () => {
    const oneOff = makeReminder({ id: 1, recurrence: null, acknowledgedAt: new Date().toISOString() });
    const daily  = makeReminder({ id: 2, recurrence: 'daily', acknowledgedAt: null });
    const weekly = makeReminder({ id: 3, recurrence: 'weekly', acknowledgedAt: null });
    // 1 out of 3 acknowledged
    expect(computeReminderAckRate([oneOff, daily, weekly])).toBeCloseTo(1 / 3);
  });
});

// ── Edge cases: past due time ─────────────────────────────────────────────────

describe('computeReminderAckRate — past due time', () => {
  it('treats a reminder with triggerAt far in the past as a normal due reminder', () => {
    // 30 days in the past — must still count as due, not expire or be ignored
    const veryOld = makeReminder({
      triggerAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: null,
    });
    expect(computeReminderAckRate([veryOld])).toBe(0);
  });

  it('returns 1 when an overdue reminder is acknowledged', () => {
    const acked = makeReminder({
      triggerAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date().toISOString(),
    });
    expect(computeReminderAckRate([acked])).toBe(1);
  });

  it('computes fractional rate correctly across a mix of past-due reminders', () => {
    const reminders = [
      makeReminder({ id: 1, triggerAt: new Date(Date.now() - 1000).toISOString(), acknowledgedAt: null }),
      makeReminder({ id: 2, triggerAt: new Date(Date.now() - 2000).toISOString(), acknowledgedAt: new Date().toISOString() }),
      makeReminder({ id: 3, triggerAt: new Date(Date.now() - 3000).toISOString(), acknowledgedAt: null }),
      makeReminder({ id: 4, triggerAt: new Date(Date.now() - 4000).toISOString(), acknowledgedAt: new Date().toISOString() }),
    ];
    expect(computeReminderAckRate(reminders)).toBeCloseTo(0.5);
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

  it('rejects numbers and objects', () => {
    expect(isValidRecurrence(1)).toBe(false);
    expect(isValidRecurrence({})).toBe(false);
    expect(isValidRecurrence(undefined)).toBe(false);
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
    expect(isValidReminderCategory('')).toBe(false);
    expect(isValidReminderCategory('WORK')).toBe(false);
  });
});
