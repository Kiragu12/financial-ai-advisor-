import type { Request, Response } from 'express';
import * as gamificationService from './gamification.service.js';

export async function summary(req: Request, res: Response): Promise<void> {
  const summary = await gamificationService.getSummary(req.user!.id);
  res.json({ summary });
}
