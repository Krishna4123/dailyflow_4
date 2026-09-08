/**
 * @file app.ts
 * Express application factory for DailyFlow API.
 * All module routers are registered here under /api/v1.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import type { ApiResponse } from './types/shared';

import { tasksRouter }    from './modules/tasks/router';
import { remindersRouter } from './modules/reminders/router';
import { habitsRouter }   from './modules/habits/router';
import { scoreRouter }    from './modules/score/router';
import { exportRouter }   from './modules/export/router';

/**
 * Creates and configures the Express application instance.
 * Registers middleware, module routers, a health check, a 404 handler,
 * and a global error handler.
 *
 * @returns Configured Express Application ready to listen on a port
 */
export function createApp(): Application {
  const app = express();

  // ── Global middleware ────────────────────────────────────────────────────
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json());

  // ── Health check ─────────────────────────────────────────────────────────
  app.get('/api/v1/health', (_req: Request, res: Response): void => {
    const payload: ApiResponse<{ status: string }> = {
      data: { status: 'ok' },
      error: null,
    };
    res.json(payload);
  });

  // ── Module routers ────────────────────────────────────────────────────────
  app.use('/api/v1/tasks',     tasksRouter);
  app.use('/api/v1/reminders', remindersRouter);
  app.use('/api/v1/habits',    habitsRouter);
  app.use('/api/v1/score',     scoreRouter);
  app.use('/api/v1',           exportRouter); // handles GET /api/v1/export

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response): void => {
    const payload: ApiResponse<null> = { data: null, error: 'Not found' };
    res.status(404).json(payload);
  });

  // ── Global error handler ──────────────────────────────────────────────────
  // Express requires the four-argument signature to identify error middleware.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(err.stack);
    const payload: ApiResponse<null> = { data: null, error: 'Internal server error' };
    res.status(500).json(payload);
  });

  return app;
}
