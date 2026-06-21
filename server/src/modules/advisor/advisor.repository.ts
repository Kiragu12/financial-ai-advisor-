import { query, type Queryable } from '../../db/database.js';
import type { ConversationRecord, MessageRecord, MessageRole } from './advisor.types.js';

/**
 * Advisor data access — the only place that runs SQL against
 * `advisor_conversations` and `advisor_messages`. Every query is scoped by
 * `user_id` so one user can never read another user's chats.
 */

export async function insertConversation(
  userId: string,
  title: string,
): Promise<ConversationRecord> {
  const { rows } = await query<ConversationRecord>(
    `insert into advisor_conversations (user_id, title)
     values ($1, $2)
     returning *`,
    [userId, title],
  );
  return rows[0]!;
}

export async function findConversations(
  userId: string,
): Promise<ConversationRecord[]> {
  const { rows } = await query<ConversationRecord>(
    `select * from advisor_conversations
     where user_id = $1
     order by updated_at desc`,
    [userId],
  );
  return rows;
}

export async function findConversationById(
  userId: string,
  conversationId: string,
): Promise<ConversationRecord | null> {
  const { rows } = await query<ConversationRecord>(
    `select * from advisor_conversations where id = $1 and user_id = $2`,
    [conversationId, userId],
  );
  return rows[0] ?? null;
}

export async function touchConversation(
  db: Queryable,
  userId: string,
  conversationId: string,
  title?: string,
): Promise<void> {
  // Bump updated_at (so the conversation sorts to the top) and optionally set
  // the title on its first exchange. Runs on the caller's transaction.
  if (title !== undefined) {
    await db.query(
      `update advisor_conversations set title = $3, updated_at = now()
       where id = $1 and user_id = $2`,
      [conversationId, userId, title],
    );
  } else {
    await db.query(
      `update advisor_conversations set updated_at = now()
       where id = $1 and user_id = $2`,
      [conversationId, userId],
    );
  }
}

export async function findMessages(
  userId: string,
  conversationId: string,
): Promise<MessageRecord[]> {
  const { rows } = await query<MessageRecord>(
    `select * from advisor_messages
     where user_id = $1 and conversation_id = $2
     order by created_at asc`,
    [userId, conversationId],
  );
  return rows;
}

export async function insertMessage(
  db: Queryable,
  data: {
    userId: string;
    conversationId: string;
    role: MessageRole;
    content: string;
  },
): Promise<MessageRecord> {
  const { rows } = await db.query<MessageRecord>(
    `insert into advisor_messages (user_id, conversation_id, role, content)
     values ($1, $2, $3, $4)
     returning *`,
    [data.userId, data.conversationId, data.role, data.content],
  );
  return rows[0]!;
}
