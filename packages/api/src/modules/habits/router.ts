/**
 * @file router.ts
 * Express routes for the Habit Tracker module.
 * All handlers delegate to service/repository and return { data, error }.
 *
 * Mounted at: /api/v1/habits
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../../types/shared';
import type { Habit, HabitLog, HabitHeatmapEntry } from './types';
import * as repo from './repository';
import { todayString } from './service';

export const habitsRouter = Router();

/** Hardcoded default userId until auth is added. */
const DEFAULT_USER_ID = 1;

// ── GET /api/v1/habits ────────────────────────────────────────────────────────

/**
 * Lists all habits for the current user.
 *
 * @param _req - Express request (unused)
 * @param res - Express response carrying ApiResponse<Habit[]>
 * @returns void
 */
habitsRouter.get('/', (_req: Request, res: Response): void => {
  const habits = repo.findAll(DEFAULT_USER_ID);
  const payload: ApiResponse<Habit[]> = { data: habits, error: null };
  res.json(payload);
});

// ── POST /api/v1/habits ───────────────────────────────────────────────────────

/**
 * Creates a new habit. Requires `name` in the request body.
 *
 * @param req - Express request with { name: string } body
 * @param res - Express response carrying ApiResponse<Habit>
 * @returns void
 */
habitsRouter.post('/', (req: Request, res: Response): void => {
  const { name } = req.body as { name?: string };

  if (!name || typeof name !== 'string' || name.trim() === '') {
    const payload: ApiResponse<null> = { data: null, error: 'name is required' };
    res.status(400).json(payload);
    return;
  }

  const habit = repo.create({ userId: DEFAULT_USER_ID, name: name.trim() });
  const payload: ApiResponse<Habit> = { data: habit, error: null };
  res.status(201).json(payload);
});

// ── DELETE /api/v1/habits/:id ─────────────────────────────────────────────────

/**
 * Deletes a habit and all its logs.
 *
 * @param req - Express request with habit id param
 * @param res - Express response carrying ApiResponse<null>
 * @returns void
 */
habitsRouter.delete('/:id', (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid id' };
    res.status(400).json(payload);
    return;
  }

  const deleted = repo.remove(id, DEFAULT_USER_ID);
  if (!deleted) {
    const payload: ApiResponse<null> = { data: null, error: 'Not found' };
    res.status(404).json(payload);
    return;
  }

  const payload: ApiResponse<null> = { data: null, error: null };
  res.json(payload);
});

// ── POST /api/v1/habits/:id/log ───────────────────────────────────────────────

/**
 * Logs today's completion for the given habit.
 * Idempotent — logging the same habit twice on the same day is a no-op.
 *
 * @param req - Express request with habit id param
 * @param res - Express response carrying ApiResponse<HabitLog>
 * @returns void
 */
habitsRouter.post('/:id/log', (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid id' };
    res.status(400).json(payload);
    return;
  }

  const habit = repo.findById(id, DEFAULT_USER_ID);
  if (!habit) {
    const payload: ApiResponse<null> = { data: null, error: 'Not found' };
    res.status(404).json(payload);
    return;
  }

  const log = repo.logToday(id, DEFAULT_USER_ID, todayString());
  const payload: ApiResponse<HabitLog> = { data: log, error: null };
  res.status(201).json(payload);
});

// ── GET /api/v1/habits/:id/heatmap ────────────────────────────────────────────

/**
 * Returns heatmap data for the last 365 days for the given habit.
 *
 * @param req - Express request with habit id param
 * @param res - Express response carrying ApiResponse<HabitHeatmapEntry[]>
 * @returns void
 */
habitsRouter.get('/:id/heatmap', (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid id' };
    res.status(400).json(payload);
    return;
  }

  const habit = repo.findById(id, DEFAULT_USER_ID);
  if (!habit) {
    const payload: ApiResponse<null> = { data: null, error: 'Not found' };
    res.status(404).json(payload);
    return;
  }

  const entries = repo.getHeatmapData(id, DEFAULT_USER_ID);
  const payload: ApiResponse<HabitHeatmapEntry[]> = { data: entries, error: null };
  res.json(payload);
});
