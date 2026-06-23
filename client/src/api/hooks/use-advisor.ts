import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../query-keys';
import type {
  Conversation,
  ConversationDetail,
  ConversationResponse,
  ConversationsResponse,
  CreateConversationResponse,
  SendMessageResponse,
} from '../types';

/**
 * AI advisor data hooks. Sending a message returns both the user turn and the
 * assistant reply; we refetch the active conversation and the list (its title
 * and ordering update on the first exchange).
 */

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.advisor.conversations,
    queryFn: async (): Promise<Conversation[]> => {
      const { conversations } = await api.get<ConversationsResponse>(
        '/api/advisor/conversations',
      );
      return conversations;
    },
  });
}

export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.advisor.conversation(conversationId),
    enabled: conversationId !== null,
    queryFn: async (): Promise<ConversationDetail> => {
      const { conversation } = await api.get<ConversationResponse>(
        `/api/advisor/conversations/${conversationId}`,
      );
      return conversation;
    },
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string }) =>
      api.post<CreateConversationResponse>('/api/advisor/conversations', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.advisor.conversations }),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      api.post<SendMessageResponse>(
        `/api/advisor/conversations/${conversationId}/messages`,
        { content },
      ),
    onSuccess: (_data, { conversationId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.advisor.conversation(conversationId) });
      qc.invalidateQueries({ queryKey: queryKeys.advisor.conversations });
    },
  });
}
