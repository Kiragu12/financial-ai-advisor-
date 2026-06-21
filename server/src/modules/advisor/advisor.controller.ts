import type { Request, Response } from 'express';
import * as advisorService from './advisor.service.js';

/**
 * HTTP layer for the advisor. requireAuth runs first (see routes), so
 * `req.user` is always present. Param ids are validated as UUIDs by the route
 * middleware.
 */

export async function createConversation(req: Request, res: Response): Promise<void> {
  const conversation = await advisorService.createConversation(req.user!.id, req.body);
  res.status(201).json({ conversation });
}

export async function listConversations(req: Request, res: Response): Promise<void> {
  const conversations = await advisorService.listConversations(req.user!.id);
  res.json({ conversations });
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  const conversationId = req.params.conversationId as string;
  const conversation = await advisorService.getConversation(req.user!.id, conversationId);
  res.json({ conversation });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const conversationId = req.params.conversationId as string;
  const result = await advisorService.sendMessage(
    req.user!.id,
    conversationId,
    req.body.content,
  );
  res.status(201).json(result);
}
