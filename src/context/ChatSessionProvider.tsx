import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from '@umijs/max';
import type { ChatMode } from '@/constants/chatMode';
import { chatModeFromPath } from '@/utils/chatModeFromPath';
import { createConversationId } from '@/utils/conversationHelpers';

interface ChatSessionContextValue {
  chatMode: ChatMode;
  conversationId: string;
  setConversationId: (id: string) => void;
  pendingScrollMessageId: string | null;
  setPendingScrollMessageId: (id: string | null) => void;
  /** 侧栏「+」或等价入口：当前 chatMode 下新建空白会话 */
  startNewConversation: () => string;
  /** 侧栏菜单进入某聊天路由时：为该 mode 新建空白会话（不加载历史） */
  startNewConversationForMode: (mode: ChatMode) => string;
}

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const chatMode = useMemo(() => chatModeFromPath(location.pathname), [location.pathname]);
  const [conversationByMode, setConversationByMode] = useState<Record<string, string>>({});
  const [pendingScrollMessageId, setPendingScrollMessageId] = useState<string | null>(null);

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

  const startNewConversationForMode = useCallback((mode: ChatMode) => {
    const nextId = createConversationId();
    setConversationByMode((current) => ({ ...current, [mode]: nextId }));
    return nextId;
  }, []);

  const startNewConversation = useCallback(
    () => startNewConversationForMode(chatMode),
    [chatMode, startNewConversationForMode],
  );

  const value = useMemo(
    () => ({
      chatMode,
      conversationId,
      setConversationId,
      pendingScrollMessageId,
      setPendingScrollMessageId,
      startNewConversation,
      startNewConversationForMode,
    }),
    [
      chatMode,
      conversationId,
      setConversationId,
      pendingScrollMessageId,
      startNewConversation,
      startNewConversationForMode,
    ],
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
