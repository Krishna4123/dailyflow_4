/**
 * @file habits.test.ts
 * Unit tests for the Habit Tracker service layer.
 * All tests are pure (no DB) — data is constructed inline.
 */

import { describe, it, expect } from 'vitest';
import {
  computeStreak,
  computeHabitStreakConsistency,
  subtractDays,
  daysBetween,
  todayString,
} from './service';
import type { HabitLog } from './types';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Builds a minimal HabitLog fixture for testing purposes.
 *
 * @param completedOn - YYYY-MM-DD date string
 * @param overrides - Partial HabitLog fields to override
 * @returns A complete HabitLog object
 */
function makeLog(completedOn: string, overrides: Partial<HabitLog> = {}): HabitLog {
  return {
    id: 1,
    habitId: 1,
    userId: 1,
    completedOn,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Generates an array of consecutive daily logs ending on `endDate`. */
function consecutiveLogs(endDate: string, days: number): HabitLog[] {
  return Array.from({ length: days }, (_, i) => makeLog(subtractDays(endDate, i)));
}

// ── computeStreak ─────────────────────────────────────────────────────────────

describe('computeStreak', () => {
  it('returns 0 for an empty log array', () => {
    expect(computeStreak([], '2025-01-10')).toBe(0);
  });

  it('returns 0 when the most recent log is not today', () => {
    const logs = [makeLog('2025-01-08')];
    expect(computeStreak(logs, '2025-01-10')).toBe(0);
  });

  it('returns 1 when only today is logged', () => {
    const logs = [makeLog('2025-01-10')];
    expect(computeStreak(logs, '2025-01-10')).toBe(1);
  });

  it('counts a 5-day consecutive streak ending today', () => {
    const today = '2025-01-10';
    const logs = consecutiveLogs(today, 5);
    expect(computeStreak(logs, today)).toBe(5);
  });

  it('stops at a gap — does not count days before the gap', () => {
    // Today + yesterday logged, 3 days ago NOT logged, 4 days ago logged
    const today = '2025-01-10';
    const logs = [
      makeLog('2025-01-10'),
      makeLog('2025-01-09'),
      // 2025-01-08 missing (gap)
      makeLog('2025-01-07'),
      makeLog('2025-01-06'),
    ];
    expect(computeStreak(logs, today)).toBe(2);
  });

  it('deduplicates multiple logs on the same day', () => {
    const today = '2025-01-10';
    const logs = [
      makeLog(today, { id: 1 }),
      makeLog(today, { id: 2 }), // duplicate
      makeLog('2025-01-09'),
    ];
    expect(computeStreak(logs, today)).toBe(2);
  });
});

// ── computeHabitStreakConsistency ─────────────────────────────────────────────

describe('computeHabitStreakConsistency', () => {
  it('returns 0 when firstLogDate is null', () => {
    expect(computeHabitStreakConsistency(5, null, '2025-01-10')).toBe(0);
  });

  it('returns 0 when streak is 0', () => {
    expect(computeHabitStreakConsistency(0, '2025-01-01', '2025-01-10')).toBe(0);
  });

  it('clamps to 1 when streak equals or exceeds denominator', () => {
    // 7-day streak, only started 7 days ago → ratio = 7/7 = 1
    expect(computeHabitStreakConsistency(7, '2025-01-04', '2025-01-10')).toBe(1);
  });

  it('uses min denominator of 7 even if started today', () => {
    // streak=3, started today → denominator = max(7, 0) = 7 → 3/7 ≈ 0.43
    expect(computeHabitStreakConsistency(3, '2025-01-10', '2025-01-10')).toBeCloseTo(3 / 7);
  });

  it('returns a value in [0, 1]', () => {
    const result = computeHabitStreakConsistency(5, '2025-01-01', '2025-01-10');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});

// ── Date helpers ──────────────────────────────────────────────────────────────

describe('subtractDays', () => {
  it('subtracts days correctly', () => {
    expect(subtractDays('2025-01-10', 3)).toBe('2025-01-07');
  });

  it('handles month boundaries', () => {
    expect(subtractDays('2025-03-01', 1)).toBe('2025-02-28');
  });
});

describe('daysBetween', () => {
  it('returns 0 for the same date', () => {
    expect(daysBetween('2025-01-10', '2025-01-10')).toBe(0);
  });

  it('returns the correct count', () => {
    expect(daysBetween('2025-01-01', '2025-01-10')).toBe(9);
  });
});

describe('todayString', () => {
  it('returns a YYYY-MM-DD formatted string', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
