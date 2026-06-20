import type { Request, Response } from 'express';
import * as walletService from './wallets.service.js';

/**
 * HTTP layer for wallets. requireAuth runs before every handler (see routes),
 * so `req.user` is always present here.
 */

export async function list(req: Request, res: Response): Promise<void> {
  const includeInactive = req.query.includeInactive === 'true';
  const wallets = await walletService.listWallets(req.user!.id, includeInactive);
  res.json({ wallets });
}

export async function create(req: Request, res: Response): Promise<void> {
  const wallet = await walletService.createWallet(req.user!.id, req.body);
  res.status(201).json({ wallet });
}

export async function get(req: Request, res: Response): Promise<void> {
  // walletIdParamSchema (in routes) already validated this as a uuid string.
  const walletId = req.params.walletId as string;
  const wallet = await walletService.getWallet(req.user!.id, walletId);
  res.json({ wallet });
}

export async function update(req: Request, res: Response): Promise<void> {
  const walletId = req.params.walletId as string;
  const wallet = await walletService.updateWallet(req.user!.id, walletId, req.body);
  res.json({ wallet });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const walletId = req.params.walletId as string;
  const wallet = await walletService.deactivateWallet(req.user!.id, walletId);
  res.json({ wallet });
}
