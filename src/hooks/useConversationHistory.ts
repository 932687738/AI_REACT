import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteConversation,
  listConversations,
  patchConversation,
  renameConversation,
} from '@/services/conversationService';
import type { ChatMode } from '@/constants/chatMode';
import type { ConversationSummary } from '@/openapi/typings';
import { normalizeConversationItem, toApiMode, type NormalizedConversation } from '@/utils/conversationHelpers';

export type { NormalizedConversation };

function normalizeItems(items: ConversationSummary[]) {
  return items
    .map(normalizeConversationItem)
    .filter((item): item is NormalizedConversation => item !== null);
}

export function conversationHistoryKey(chatMode: ChatMode) {
  return ['conversation-history', chatMode] as const;
}

export function useConversationHistory(chatMode: ChatMode) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: conversationHistoryKey(chatMode),
    queryFn: async () => {
      const items = await listConversations({ mode: toApiMode(chatMode), limit: 50 });
      return normalizeItems(Array.isArray(items) ? items : []);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameConversation(id, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationHistoryKey(chatMode) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationHistoryKey(chatMode) });
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      patchConversation(id, { pinned }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationHistoryKey(chatMode) });
    },
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    refresh: query.refetch,
    renameConversation: renameMutation.mutateAsync,
    pinConversation: pinMutation.mutateAsync,
    deleteConversation: deleteMutation.mutateAsync,
  };
}
