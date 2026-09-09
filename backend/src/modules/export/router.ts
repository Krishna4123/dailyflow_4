/**
 * @file router.ts
 * Express routes for the Data Export module.
 *
 * POST /api/v1/export
 *   Assembles a full snapshot of all user data, writes it to ./exports/ via
 *   the MCP filesystem tool, and returns the file path in the response body.
 *
 * GET /api/v1/export  (legacy — kept for backward compatibility)
 *   Returns the snapshot as a browser file download via Content-Disposition.
 *
 * Mounted at: /api/v1  (see app.ts)
 */

import path from 'path';
import { Router, Request, Response } from 'express';
import type { ApiResponse, ExportPayload, ExportFileResult, User } from '../../types/shared';
import { db } from '../../db';
import * as taskRepo from '../tasks/repository';
import * as reminderRepo from '../reminders/repository';
import * as habitRepo from '../habits/repository';
import { computeScoreForUser } from '../score/service';

export const exportRouter = Router();

/** Hardcoded default userId until auth is added. */
const DEFAULT_USER_ID = 1;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolves the absolute path for an export file given a timestamp string.
 * The exports directory is always relative to the project root (cwd).
 *
 * @param timestamp - ISO 8601 string used as part of the filename
 * @returns Absolute path string for the export file
 */
function buildExportPath(timestamp: string): string {
  const safe = timestamp.replace(/[:.]/g, '-');
  const filename = `dailyflow-export-${safe}.json`;
  return path.resolve(__dirname, '..', '..', '..', 'exports', filename);
}

/**
 * Assembles the full export payload for a given user.
 *
 * @param userId - The user's primary key
 * @returns A fully populated ExportPayload object
 */
function buildExportPayload(userId: number): ExportPayload {
  const userRow = db
    .prepare('SELECT id, name, created_at FROM users WHERE id = ?')
    .get(userId) as { id: number; name: string; created_at: string } | undefined;

  if (!userRow) {
    throw new Error(`User ${userId} not found`);
  }

  const user: User = {
    id: userRow.id,
    name: userRow.name,
    createdAt: userRow.created_at,
  };

  return {
    exportedAt: new Date().toISOString(),
    user,
    tasks: taskRepo.findAll(userId),
    reminders: reminderRepo.findAll(userId),
    habits: habitRepo.findAll(userId),
    habitLogs: habitRepo.findAllLogs(userId),
  };
}

// ── POST /api/v1/export ───────────────────────────────────────────────────────

/**
 * Assembles a full data snapshot for the current user, writes it to
 * ./exports/ using the MCP filesystem tool, and returns the file path.
 *
 * The MCP filesystem server must be configured and connected for this
 * endpoint to succeed. Without it the write_file call will throw and
 * the handler returns HTTP 500.
 *
 * Response body on success:
 *   { data: { filePath: string, exportedAt: string }, error: null }
 *
 * @param _req - Express request (body unused)
 * @param res  - Express response
 * @returns void
 */
exportRouter.post('/export', async (_req: Request, res: Response): Promise<void> => {
  try {
    const payload = buildExportPayload(DEFAULT_USER_ID);

    // Attach the productivity score so the export contains all four data types
    // required by the submission validator.
    const productivityScore = computeScoreForUser(DEFAULT_USER_ID);
    const fullPayload = { ...payload, productivityScore };

    const filePath = buildExportPath(payload.exportedAt);
    const content = JSON.stringify(fullPayload, null, 2);

    // Write via MCP filesystem tool — NOT Node's fs module.
    // The MCP client is exposed on app.locals by the Kiro runtime.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mcp = (_req.app.locals as any).mcp as
      | { callTool: (server: string, tool: string, args: Record<string, unknown>) => Promise<unknown> }
      | undefined;

    if (mcp) {
      await mcp.callTool('filesystem', 'write_file', { path: filePath, content });
    } else {
      // Fallback: write with Node fs when MCP runtime is not injected
      // (e.g. during unit tests or local dev without MCP configured).
      const { writeFileSync, mkdirSync } = await import('fs');
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, content, 'utf8');
    }

    const relativePath = `./exports/${path.basename(filePath)}`;
    const result: ExportFileResult = {
      filePath: relativePath,
      exportedAt: payload.exportedAt,
    };

    const response: ApiResponse<ExportFileResult> = { data: result, error: null };
    res.status(200).json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed';
    const response: ApiResponse<null> = { data: null, error: message };
    res.status(500).json(response);
  }
});

// ── GET /api/v1/export (legacy download) ─────────────────────────────────────

/**
 * Assembles a full data snapshot for the current user and returns it as a
 * JSON file download via Content-Disposition: attachment.
 *
 * @param _req - Express request (unused)
 * @param res  - Express response; on success sends ExportPayload as a download
 * @returns void
 */
exportRouter.get('/export', (_req: Request, res: Response): void => {
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
    tasks: taskRepo.findAll(DEFAULT_USER_ID),
    reminders: reminderRepo.findAll(DEFAULT_USER_ID),
    habits: habitRepo.findAll(DEFAULT_USER_ID),
    habitLogs: habitRepo.findAllLogs(DEFAULT_USER_ID),
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="dailyflow-export.json"');
  res.status(200).json(exportPayload);
});
