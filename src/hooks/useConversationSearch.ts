import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchConversations } from '@/services/conversationService';
import type { ChatMode } from '@/constants/chatMode';
import type { ConversationSearchHit, ConversationSearchPage } from '@/openapi/typings';
import { toApiMode } from '@/utils/conversationHelpers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

export const CONVERSATION_SEARCH_ROOT_KEY = 'conversation-search';

export function conversationSearchKey(chatMode: ChatMode, query: string) {
  return [CONVERSATION_SEARCH_ROOT_KEY, chatMode, query] as const;
}

export function pruneConversationFromSearchCache(
  queryClient: QueryClient,
  conversationId: string,
) {
  queryClient.setQueriesData<InfiniteData<ConversationSearchPage>>(
    { queryKey: [CONVERSATION_SEARCH_ROOT_KEY] },
    (old) => {
      if (!old?.pages) {
        return old;
      }
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: (page.items ?? []).filter((item) => item.conversationId !== conversationId),
        })),
      };
    },
  );
}

export function useConversationSearch(chatMode: ChatMode, query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const enabled = debouncedQuery.length > 0;

  const queryResult = useInfiniteQuery({
    queryKey: conversationSearchKey(chatMode, debouncedQuery),
    enabled,
    staleTime: 0,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 0;
      return searchConversations({
        q: debouncedQuery,
        mode: toApiMode(chatMode),
        page,
        size: PAGE_SIZE,
      });
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

  const items: ConversationSearchHit[] =
    queryResult.data?.pages.flatMap((page) => page.items ?? []) ?? [];

  return {
    debouncedQuery,
    items,
    isLoading: queryResult.isLoading || (query.trim() !== debouncedQuery && query.trim().length > 0),
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    hasMore: Boolean(queryResult.hasNextPage),
    fetchMore: queryResult.fetchNextPage,
    refetch: queryResult.refetch,
  };
}
