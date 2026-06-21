import { z } from 'zod';

/**
 * Advisor request validation.
 *
 * - Creating a conversation may include an optional title; otherwise the service
 *   derives one from the first message.
 * - Sending a message carries the user's chat text (bounded to keep prompt size
 *   and cost predictable).
 */

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

export const conversationIdParamSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation id'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
