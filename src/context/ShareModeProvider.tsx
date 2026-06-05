import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ShareModeContextValue {
  active: boolean;
  conversationId: string | null;
  selectedGroupIds: Set<string>;
  enter: (conversationId: string) => void;
  exit: () => void;
  toggleGroup: (groupId: string) => void;
  selectAll: (groupIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (groupId: string) => boolean;
}

const ShareModeContext = createContext<ShareModeContextValue | null>(null);

export function ShareModeProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(() => new Set());

  const enter = useCallback((nextConversationId: string) => {
    setConversationId(nextConversationId);
    setSelectedGroupIds(new Set());
    setActive(true);
  }, []);

  const exit = useCallback(() => {
    setActive(false);
    setConversationId(null);
    setSelectedGroupIds(new Set());
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setSelectedGroupIds((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((groupIds: string[]) => {
    setSelectedGroupIds(new Set(groupIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedGroupIds(new Set());
  }, []);

  const isSelected = useCallback(
    (groupId: string) => selectedGroupIds.has(groupId),
    [selectedGroupIds],
  );

  const value = useMemo(
    () => ({
      active,
      conversationId,
      selectedGroupIds,
      enter,
      exit,
      toggleGroup,
      selectAll,
      clearSelection,
      isSelected,
    }),
    [
      active,
      conversationId,
      selectedGroupIds,
      enter,
      exit,
      toggleGroup,
      selectAll,
      clearSelection,
      isSelected,
    ],
  );

  return <ShareModeContext.Provider value={value}>{children}</ShareModeContext.Provider>;
}

export function useShareMode() {
  const context = useContext(ShareModeContext);
  if (!context) {
    throw new Error('useShareMode must be used within ShareModeProvider');
  }
  return context;
}
