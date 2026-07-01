import { withTransaction } from '../../db/database.js';
import { AppError } from '../../shared/app-error.js';
import * as advisorRepo from './advisor.repository.js';
import * as advisorClient from './advisor.client.js';
import { buildFinancialContext } from './advisor.context.js';
import {
  toConversation,
  toMessage,
  type Conversation,
  type Message,
} from './advisor.types.js';
import type { CreateConversationInput } from './advisor.schemas.js';

/**
 * Advisor business logic — owns the chat flow:
 *   1. record the user's message context (history) and build a financial snapshot
 *   2. ask Claude for a reply
 *   3. persist the user message + assistant reply together (atomic)
 *
 * The Claude call happens BEFORE the DB writes so a failed/timed-out request
 * leaves no orphaned user message — nothing is persisted unless we got a reply.
 */

const DEFAULT_TITLE = 'New conversation';

export async function createConversation(
  userId: string,
  input: CreateConversationInput,
): Promise<Conversation> {
  const existing = await advisorRepo.findConversations(userId);
  if (existing.length > 0) {
    return toConversation(existing[0]!);
  }

  const record = await advisorRepo.insertConversation(
    userId,
    input.title ?? DEFAULT_TITLE,
  );
  return toConversation(record);
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  const records = await advisorRepo.findConversations(userId);
  return records.map(toConversation);
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export async function getConversation(
  userId: string,
  conversationId: string,
): Promise<ConversationDetail> {
  const record = await advisorRepo.findConversationById(userId, conversationId);
  if (!record) {
    throw AppError.notFound('Conversation not found.');
  }
  const messages = await advisorRepo.findMessages(userId, conversationId);
  return { ...toConversation(record), messages: messages.map(toMessage) };
}

export interface SendMessageResult {
  userMessage: Message;
  assistantMessage: Message;
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  content: string,
): Promise<SendMessageResult> {
  const conversation = await advisorRepo.findConversationById(userId, conversationId);
  if (!conversation) {
    throw AppError.notFound('Conversation not found.');
  }

  // Prior turns + the new user message form the prompt to Claude. Only
  // user/assistant rows are sent (the system prompt is rebuilt fresh below).
  const priorMessages = await advisorRepo.findMessages(userId, conversationId);
  const history = priorMessages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  history.push({ role: 'user', content });

  const financialContext = await buildFinancialContext(userId);
  const reply = await advisorClient.generateReply(history, financialContext);

  // Got a reply — now persist both turns atomically and update the thread.
  return withTransaction(async (db) => {
    const userMessage = await advisorRepo.insertMessage(db, {
      userId,
      conversationId,
      role: 'user',
      content,
    });
    const assistantMessage = await advisorRepo.insertMessage(db, {
      userId,
      conversationId,
      role: 'assistant',
      content: reply,
    });

    // On the first exchange, name the thread from the opening message.
    const isFirstExchange =
      priorMessages.length === 0 && conversation.title === DEFAULT_TITLE;
    const newTitle = isFirstExchange ? deriveTitle(content) : undefined;
    await advisorRepo.touchConversation(db, userId, conversationId, newTitle);

    return {
      userMessage: toMessage(userMessage),
      assistantMessage: toMessage(assistantMessage),
    };
  });
}

/** A short, human-readable thread title from the first user message. */
function deriveTitle(content: string): string {
  const trimmed = content.trim().replace(/\s+/g, ' ');
  return trimmed.length <= 60 ? trimmed : `${trimmed.slice(0, 57)}...`;
}
