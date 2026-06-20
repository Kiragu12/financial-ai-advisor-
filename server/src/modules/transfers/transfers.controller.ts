import type { Request, Response } from 'express';
import * as transferService from './transfers.service.js';

/**
 * HTTP layer for transfers. requireAuth runs first (see routes), so
 * `req.user` is always present.
 */

export async function create(req: Request, res: Response): Promise<void> {
  const transfer = await transferService.createTransfer(req.user!.id, req.body);
  res.status(201).json({ transfer });
}

export async function list(req: Request, res: Response): Promise<void> {
  const transfers = await transferService.listTransfers(req.user!.id);
  res.json({ transfers });
}

export async function get(req: Request, res: Response): Promise<void> {
  const transferId = req.params.transferId as string;
  const transfer = await transferService.getTransfer(req.user!.id, transferId);
  res.json({ transfer });
}
