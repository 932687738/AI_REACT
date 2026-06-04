import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from '@umijs/max';
import type { ChatMode } from '@/constants/chatMode';
import { chatModeFromPath } from '@/utils/chatModeFromPath';
import { createConversationId } from '@/utils/conversationHelpers';

interface ChatSessionContextValue {
  chatMode: ChatMode;
  conversationId: string;
  setConversationId: (id: string) => void;
  startNewConversation: () => string;
}

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const chatMode = useMemo(() => chatModeFromPath(location.pathname), [location.pathname]);
  const [conversationByMode, setConversationByMode] = useState<Record<string, string>>({});

  useEffect(() => {
    setConversationByMode((current) => {
      if (current[chatMode]) {
        return current;
      }
      return { ...current, [chatMode]: createConversationId() };
    });
  }, [chatMode]);

  const conversationId = conversationByMode[chatMode] || createConversationId();

  const setConversationId = useCallback(
    (id: string) => {
      setConversationByMode((current) => ({ ...current, [chatMode]: id }));
    },
    [chatMode],
  );

  const startNewConversation = useCallback(() => {
    const nextId = createConversationId();
    setConversationByMode((current) => ({ ...current, [chatMode]: nextId }));
    return nextId;
  }, [chatMode]);

  const value = useMemo(
    () => ({
      chatMode,
      conversationId,
      setConversationId,
      startNewConversation,
    }),
    [chatMode, conversationId, setConversationId, startNewConversation],
  );

  return <ChatSessionContext.Provider value={value}>{children}</ChatSessionContext.Provider>;
}

export function useChatSession() {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error('useChatSession must be used within ChatSessionProvider');
  }
  return context;
}
