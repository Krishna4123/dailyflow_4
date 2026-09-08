/**
 * @file router.ts
 * Express route for the Data Export module.
 * Returns a full JSON snapshot of all user data as a file download.
 *
 * Mounted at: /api/v1/export
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse, ExportPayload, User } from '../../types/shared';
import { db } from '../../db';
import * as taskRepo from '../tasks/repository';
import * as reminderRepo from '../reminders/repository';
import * as habitRepo from '../habits/repository';

export const exportRouter = Router();

/** Hardcoded default userId until auth is added. */
const DEFAULT_USER_ID = 1;

// ── GET /api/v1/export ────────────────────────────────────────────────────────

/**
 * Assembles a full data snapshot for the current user and returns it as a
 * JSON file download.
 *
 * Response headers:
 *   Content-Type:        application/json
 *   Content-Disposition: attachment; filename="dailyflow-export.json"
 *
 * @param _req - Express request (unused)
 * @param res  - Express response; on success sends the ExportPayload as a download
 * @returns void
 */
exportRouter.get('/export', (_req: Request, res: Response): void => {
  // Fetch the user row
  const userRow = db
    .prepare('SELECT id, name, created_at FROM users WHERE id = ?')
    .get(DEFAULT_USER_ID) as { id: number; name: string; created_at: string } | undefined;

  if (!userRow) {
    const payload: ApiResponse<null> = { data: null, error: 'User not found' };
    res.status(404).json(payload);
    return;
  }

  const user: User = {
    id: userRow.id,
    name: userRow.name,
    createdAt: userRow.created_at,
  };

  const exportPayload: ExportPayload = {
    exportedAt: new Date().toISOString(),
    user,
    tasks:     taskRepo.findAll(DEFAULT_USER_ID),
    reminders: reminderRepo.findAll(DEFAULT_USER_ID),
    habits:    habitRepo.findAll(DEFAULT_USER_ID),
    habitLogs: habitRepo.findAllLogs(DEFAULT_USER_ID),
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="dailyflow-export.json"');
  res.status(200).json(exportPayload);
});
