/**
 * @file router.ts
 * Express routes for the Task Board module.
 * All handlers delegate to service/repository and return { data, error }.
 *
 * Mounted at: /api/v1/tasks
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../../types/shared';
import type { Task, CreateTaskInput, UpdateTaskInput } from './types';
import * as repo from './repository';
import { isValidTaskStatus, isValidTaskPriority, isValidTaskCategory } from './service';

export const tasksRouter = Router();

/** Hardcoded default userId until auth is added. */
const DEFAULT_USER_ID = 1;

// ── GET /api/v1/tasks ──────────────────────────────────────────────────────────

/**
 * Lists all tasks for the current user.
 *
 * @param _req - Express request (unused)
 * @param res - Express response carrying ApiResponse<Task[]>
 * @returns void
 */
tasksRouter.get('/', (_req: Request, res: Response): void => {
  const tasks = repo.findAll(DEFAULT_USER_ID);
  const payload: ApiResponse<Task[]> = { data: tasks, error: null };
  res.json(payload);
});

// ── POST /api/v1/tasks ─────────────────────────────────────────────────────────

/**
 * Creates a new task. Requires `title` in the request body.
 *
 * @param req - Express request with CreateTaskInput body
 * @param res - Express response carrying ApiResponse<Task>
 * @returns void
 */
tasksRouter.post('/', (req: Request, res: Response): void => {
  const { title, status, priority, category, dueDate } = req.body as Partial<CreateTaskInput>;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    const payload: ApiResponse<null> = { data: null, error: 'title is required' };
    res.status(400).json(payload);
    return;
  }

  if (status !== undefined && !isValidTaskStatus(status)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid status value' };
    res.status(400).json(payload);
    return;
  }

  if (priority !== undefined && !isValidTaskPriority(priority)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid priority value' };
    res.status(400).json(payload);
    return;
  }

  if (category !== undefined && !isValidTaskCategory(category)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid category value' };
    res.status(400).json(payload);
    return;
  }

  const task = repo.create({ userId: DEFAULT_USER_ID, title: title.trim(), status, priority, category, dueDate });
  const payload: ApiResponse<Task> = { data: task, error: null };
  res.status(201).json(payload);
});

// ── PATCH /api/v1/tasks/:id ────────────────────────────────────────────────────

/**
 * Partially updates an existing task.
 *
 * @param req - Express request with task id param and UpdateTaskInput body
 * @param res - Express response carrying ApiResponse<Task>
 * @returns void
 */
tasksRouter.patch('/:id', (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid id' };
    res.status(400).json(payload);
    return;
  }

  const { title, status, priority, category, dueDate } = req.body as Partial<UpdateTaskInput>;

  if (status !== undefined && !isValidTaskStatus(status)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid status value' };
    res.status(400).json(payload);
    return;
  }

  if (priority !== undefined && !isValidTaskPriority(priority)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid priority value' };
    res.status(400).json(payload);
    return;
  }

  if (category !== undefined && !isValidTaskCategory(category)) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid category value' };
    res.status(400).json(payload);
    return;
  }

  const updated = repo.update(id, DEFAULT_USER_ID, { title, status, priority, category, dueDate });
  if (!updated) {
    const payload: ApiResponse<null> = { data: null, error: 'Not found' };
    res.status(404).json(payload);
    return;
  }

  const payload: ApiResponse<Task> = { data: updated, error: null };
  res.json(payload);
});

// ── DELETE /api/v1/tasks/:id ───────────────────────────────────────────────────

/**
 * Deletes a task by its primary key.
 *
 * @param req - Express request with task id param
 * @param res - Express response carrying ApiResponse<null>
 * @returns void
 */
tasksRouter.delete('/:id', (req: Request, res: Response): void => {
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
