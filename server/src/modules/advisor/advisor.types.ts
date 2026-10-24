/**
 * AI advisor shapes.
 *
 * A conversation is a chat thread between the user and the advisor; messages are
 * its turns: 'user' and 'assistant'. ('system' is kept in the type for rows
 * written by the earlier LLM-backed advisor; new replies never use it.)
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ConversationRecord {
  id: string;
  user_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  created_at: Date;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export function toConversation(record: ConversationRecord): Conversation {
  return {
    id: record.id,
    title: record.title,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

export function toMessage(record: MessageRecord): Message {
  return {
    id: record.id,
    role: record.role,
    content: record.content,
    createdAt: record.created_at.toISOString(),
  };
}
