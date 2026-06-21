import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { advisorLimiter } from '../../middleware/rate-limit.js';
import {
  createConversationSchema,
  sendMessageSchema,
  conversationIdParamSchema,
} from './advisor.schemas.js';
import * as advisorController from './advisor.controller.js';

/**
 * Advisor routes — mounted at /api/advisor. Every route is private.
 *
 *   GET  /conversations                    list the user's conversations
 *   POST /conversations                    start a new conversation
 *   GET  /conversations/:id                fetch one conversation with messages
 *   POST /conversations/:id/messages       send a message, get the AI reply
 */
export const advisorRouter = Router();

advisorRouter.use(requireAuth);

advisorRouter.get('/conversations', asyncHandler(advisorController.listConversations));

advisorRouter.post(
  '/conversations',
  validate({ body: createConversationSchema }),
  asyncHandler(advisorController.createConversation),
);

advisorRouter.get(
  '/conversations/:conversationId',
  validate({ params: conversationIdParamSchema }),
  asyncHandler(advisorController.getConversation),
);

advisorRouter.post(
  '/conversations/:conversationId/messages',
  advisorLimiter,
  validate({ params: conversationIdParamSchema, body: sendMessageSchema }),
  asyncHandler(advisorController.sendMessage),
);
