import type { Request, Response } from 'express';
import { goalStatusEnum } from './goals.schemas.js';
import * as goalService from './goals.service.js';

/**
 * HTTP layer for goals. requireAuth runs first (see routes), so `req.user` is
 * always present. Param ids are validated as UUIDs by the route middleware.
 */

export async function create(req: Request, res: Response): Promise<void> {
  const goal = await goalService.createGoal(req.user!.id, req.body);
  res.status(201).json({ goal });
}

export async function list(req: Request, res: Response): Promise<void> {
  // Optional ?status= filter; ignore an invalid value rather than erroring.
  const parsed = goalStatusEnum.safeParse(req.query.status);
  const goals = await goalService.listGoals(
    req.user!.id,
    parsed.success ? parsed.data : undefined,
  );
  res.json({ goals });
}

export async function get(req: Request, res: Response): Promise<void> {
  const goalId = req.params.goalId as string;
  const goal = await goalService.getGoal(req.user!.id, goalId);
  res.json({ goal });
}

export async function update(req: Request, res: Response): Promise<void> {
  const goalId = req.params.goalId as string;
  const goal = await goalService.updateGoal(req.user!.id, goalId, req.body);
  res.json({ goal });
}

export async function contribute(req: Request, res: Response): Promise<void> {
  const goalId = req.params.goalId as string;
  const result = await goalService.contribute(req.user!.id, goalId, req.body);
  res.status(201).json(result);
}

export async function listContributions(
  req: Request,
  res: Response,
): Promise<void> {
  const goalId = req.params.goalId as string;
  const contributions = await goalService.listContributions(req.user!.id, goalId);
  res.json({ contributions });
}
