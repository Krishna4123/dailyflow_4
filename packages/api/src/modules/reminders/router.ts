/**
 * @file router.ts
 * Express routes for the Reminder Engine module.
 * All handlers delegate to service/repository and return { data, error }.
 *
 * Mounted at: /api/v1/reminders
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../../types/shared';
import type { Reminder, CreateReminderInput, UpdateReminderInput } from './types';
import * as repo from './repository';
import { isValidRecurrence, isValidReminderCategory } from './service';

export const remindersRouter = Router();

/** Hardcoded default userId until auth is added. */
const DEFAULT_USER_ID = 1;

// ── GET /api/v1/reminders ──────────────────────────────────────────────────────

/**
 * Lists all reminders for the current user, ordered by trigger time.
 *
 * @param _req - Express request (unused)
 * @param res - Express response carrying ApiResponse<Reminder[]>
 * @returns void
 */
remindersRouter.get('/', (_req: Request, res: Response): void => {
  const reminders = repo.findAll(DEFAULT_USER_ID);
  const payload: ApiResponse<Reminder[]> = { data: reminders, error: null };
  res.json(payload);
});

// ── POST /api/v1/reminders ─────────────────────────────────────────────────────

/**
 * Creates a new reminder. Requires `label` and `triggerAt` in the request body.
 *
 * @param req - Express request with CreateReminderInput body
 * @param res - Express response carrying ApiResponse<Reminder>
 * @returns void
 */
remindersRouter.post('/', (req: Request, res: Response): void => {
  const { label, category, triggerAt, recurrence } = req.body as Partial<CreateReminderInput>;

  if (!label || typeof label !== 'string' || label.trim() === '') {
    const payload: ApiResponse<null> = { data: null, error: 'label is required' };
    res.status(400).json(payload);
    return;
  }

  if (!triggerAt || typeof triggerAt !== 'string') {
    const payload: ApiResponse<null> = { data: null, error: 'triggerAt is required' };
    res.status(400).json(payload);
    return;
  }

  if (category !== undefined && !isValidReminderCategory(category)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid category value' };
    res.status(400).json(payload);
    return;
  }

  if (recurrence !== undefined && !isValidRecurrence(recurrence)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid recurrence value; must be daily, weekly, or null' };
    res.status(400).json(payload);
    return;
  }

  const reminder = repo.create({ userId: DEFAULT_USER_ID, label: label.trim(), category, triggerAt, recurrence });
  const payload: ApiResponse<Reminder> = { data: reminder, error: null };
  res.status(201).json(payload);
});

// ── PATCH /api/v1/reminders/:id ────────────────────────────────────────────────

/**
 * Partially updates an existing reminder.
 *
 * @param req - Express request with reminder id param and UpdateReminderInput body
 * @param res - Express response carrying ApiResponse<Reminder>
 * @returns void
 */
remindersRouter.patch('/:id', (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid id' };
    res.status(400).json(payload);
    return;
  }

  const { label, category, triggerAt, recurrence } = req.body as Partial<UpdateReminderInput>;

  if (category !== undefined && !isValidReminderCategory(category)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid category value' };
    res.status(400).json(payload);
    return;
  }

  if (recurrence !== undefined && !isValidRecurrence(recurrence)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid recurrence value; must be daily, weekly, or null' };
    res.status(400).json(payload);
    return;
  }

  const updated = repo.update(id, DEFAULT_USER_ID, { label, category, triggerAt, recurrence });
  if (!updated) {
    const payload: ApiResponse<null> = { data: null, error: 'Not found' };
    res.status(404).json(payload);
    return;
  }

  const payload: ApiResponse<Reminder> = { data: updated, error: null };
  res.json(payload);
});

// ── POST /api/v1/reminders/:id/acknowledge ────────────────────────────────────

/**
 * Acknowledges (dismisses) a reminder. Idempotent — safe to call multiple times.
 *
 * @param req - Express request with reminder id param
 * @param res - Express response carrying ApiResponse<Reminder>
 * @returns void
 */
remindersRouter.post('/:id/acknowledge', (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid id' };
    res.status(400).json(payload);
    return;
  }

  const reminder = repo.acknowledge(id, DEFAULT_USER_ID);
  if (!reminder) {
    const payload: ApiResponse<null> = { data: null, error: 'Not found' };
    res.status(404).json(payload);
    return;
  }

  const payload: ApiResponse<Reminder> = { data: reminder, error: null };
  res.json(payload);
});

// ── DELETE /api/v1/reminders/:id ──────────────────────────────────────────────

/**
 * Deletes a reminder by its primary key.
 *
 * @param req - Express request with reminder id param
 * @param res - Express response carrying ApiResponse<null>
 * @returns void
 */
remindersRouter.delete('/:id', (req: Request, res: Response): void => {
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
