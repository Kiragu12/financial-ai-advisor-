import type { Request, Response } from 'express';
import * as categoriserService from './categoriser.service.js';

export async function suggest(req: Request, res: Response): Promise<void> {
  const suggestion = await categoriserService.suggest(req.user!.id, req.body);
  res.json(suggestion);
}
