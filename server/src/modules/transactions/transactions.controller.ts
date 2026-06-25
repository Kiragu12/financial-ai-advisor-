import type { Request, Response } from 'express';
import * as txnService from './transactions.service.js';
import { listTransactionsQuerySchema } from './transactions.schemas.js';

/**
 * HTTP layer for transactions. requireAuth runs first (see routes), so
 * `req.user` is always present.
 */

export async function create(req: Request, res: Response): Promise<void> {
  const transaction = await txnService.recordTransaction(req.user!.id, req.body);
  res.status(201).json({ transaction });
}

export async function list(req: Request, res: Response): Promise<void> {
  // Validate/coerce the query string here (req.query is read-only in Express 5).
  // A bad filter throws ZodError → handled as a 400 by the error handler.
  const filters = listTransactionsQuerySchema.parse(req.query);
  const transactions = await txnService.listTransactions(req.user!.id, filters);
  res.json({ transactions });
}

export async function get(req: Request, res: Response): Promise<void> {
  const transactionId = req.params.transactionId as string;
  const transaction = await txnService.getTransaction(req.user!.id, transactionId);
  res.json({ transaction });
}

export async function update(req: Request, res: Response): Promise<void> {
  const transactionId = req.params.transactionId as string;
  const transaction = await txnService.updateTransaction(
    req.user!.id,
    transactionId,
    req.body,
  );
  res.json({ transaction });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const transactionId = req.params.transactionId as string;
  const transaction = await txnService.deleteTransaction(req.user!.id, transactionId);
  res.json({ transaction });
}
