/**
 * @file router.ts
 * Express routes for the Productivity Score module.
 *
 * Mounted at: /api/v1/score
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../../types/shared';
import type { ProductivityScore } from './types';
import { computeScoreForUser } from './service';

export const scoreRouter = Router();

// ── GET /api/v1/score/:userId ─────────────────────────────────────────────────

/**
 * Computes and returns the Productivity Score for the specified user.
 *
 * Path parameter:
 *   userId — integer primary key of the user to compute the score for
 *
 * @param req - Express request; req.params.userId must be a positive integer
 * @param res - Express response carrying ApiResponse<ProductivityScore>
 * @returns void
 */
scoreRouter.get('/:userId', (req: Request, res: Response): void => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId < 1) {
    const payload: ApiResponse<null> = { data: null, error: 'invalid userId' };
    res.status(400).json(payload);
    return;
  }

  const score = computeScoreForUser(userId);
  const payload: ApiResponse<ProductivityScore> = { data: score, error: null };
  res.json(payload);
});
