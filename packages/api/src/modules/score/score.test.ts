/**
 * @file score.test.ts
 * Unit tests for the Productivity Score service layer.
 * All tests are pure (no DB) — values are passed directly to computeProductivityScore.
 */

import { describe, it, expect } from 'vitest';
import {
  computeProductivityScore,
  WEIGHT_TASKS,
  WEIGHT_REMINDERS,
  WEIGHT_HABITS,
} from './service';

// ── Formula weight assertions ─────────────────────────────────────────────────

describe('formula weights', () => {
  it('WEIGHT_TASKS is exactly 0.4', () => {
    expect(WEIGHT_TASKS).toBe(0.4);
  });

  it('WEIGHT_REMINDERS is exactly 0.3', () => {
    expect(WEIGHT_REMINDERS).toBe(0.3);
  });

  it('WEIGHT_HABITS is exactly 0.3', () => {
    expect(WEIGHT_HABITS).toBe(0.3);
  });

  it('weights sum to exactly 1.0', () => {
    expect(WEIGHT_TASKS + WEIGHT_REMINDERS + WEIGHT_HABITS).toBeCloseTo(1.0);
  });
});

// ── computeProductivityScore — boundary cases ─────────────────────────────────

describe('computeProductivityScore', () => {
  it('returns score 0 when all sub-rates are 0', () => {
    expect(computeProductivityScore(0, 0, 0).score).toBe(0);
  });

  it('returns score 100 when all sub-rates are 1', () => {
    expect(computeProductivityScore(1, 1, 1).score).toBe(100);
  });

  it('clamps above-1 sub-rates — score never exceeds 100', () => {
    expect(computeProductivityScore(2, 2, 2).score).toBe(100);
  });

  it('clamps negative sub-rates — score never goes below 0', () => {
    expect(computeProductivityScore(-1, -1, -1).score).toBe(0);
  });

  // ── Weight isolation tests ────────────────────────────────────────────────
  // Each test sets exactly one sub-rate to 1 and the others to 0, then
  // asserts the score equals that weight × 100. This directly verifies
  // the 0.4 / 0.3 / 0.3 formula breakdown.

  it('task weight: task=1, others=0 → score 40', () => {
    expect(computeProductivityScore(1, 0, 0).score).toBeCloseTo(40, 2);
  });

  it('reminder weight: reminder=1, others=0 → score 30', () => {
    expect(computeProductivityScore(0, 1, 0).score).toBeCloseTo(30, 2);
  });

  it('habit weight: habit=1, others=0 → score 30', () => {
    expect(computeProductivityScore(0, 0, 1).score).toBeCloseTo(30, 2);
  });

  // ── Composite calculation ─────────────────────────────────────────────────

  it('mixed rates produce the correct composite score', () => {
    // task=0.8, reminder=0.5, habit=0.6
    // raw = 0.8*0.4 + 0.5*0.3 + 0.6*0.3
    //     = 0.32    + 0.15    + 0.18    = 0.65 → 65.00
    expect(computeProductivityScore(0.8, 0.5, 0.6).score).toBeCloseTo(65, 2);
  });

  it('result rounds to 2 decimal places', () => {
    // 1/3 each → raw ≈ 0.3333 → score ≈ 33.33
    const result = computeProductivityScore(1 / 3, 1 / 3, 1 / 3);
    expect(result.score).toBeCloseTo(33.33, 2);
  });

  // ── Shape of returned object ──────────────────────────────────────────────

  it('populates all required fields', () => {
    const result = computeProductivityScore(0.5, 0.6, 0.7);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('taskCompletionRate', 0.5);
    expect(result).toHaveProperty('reminderAckRate', 0.6);
    expect(result).toHaveProperty('habitStreakConsistency', 0.7);
    expect(result).toHaveProperty('computedAt');
    expect(typeof result.computedAt).toBe('string');
  });

  it('computedAt is a valid ISO 8601 string', () => {
    const result = computeProductivityScore(0, 0, 0);
    expect(() => new Date(result.computedAt)).not.toThrow();
    expect(new Date(result.computedAt).toISOString()).toBe(result.computedAt);
  });
});
