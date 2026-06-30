import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import { useQueryClient } from '@tanstack/react-query';
import { CHAT_MODE, type ChatMode } from '@/constants/chatMode';
import { useChatSession } from '@/context/ChatSessionProvider';
import { sendChatByMode } from '@/services/chatService';
import {
  ensureConversationOnServer,
  fetchNormalizedMessages,
  persistAgentTurn,
} from '@/services/conversationPersist';
import type { AgentProgressStep, ConversationMessage, KnowledgeChatMeta } from '@/openapi/typings';
import type { SuperAgentArtifactEvent, SuperAgentMetaEvent, SuperAgentProgressEvent, ChatArtifactPayload } from '@/utils/SuperAgentSse';
import { extractProgressFromText, stripAgentStreamDecorations } from '@/utils/agentChatDisplay';
import { stripKnowledgeMetaFromText } from '@/utils/KnowledgeCitation';
import { conversationHistoryKey } from '@/hooks/useConversationHistory';
import { deriveConversationTitle } from '@/utils/conversationHelpers';

function appendAgentProgressStep(
  prev: AgentProgressStep[],
  step: AgentProgressStep,
): AgentProgressStep[] {
  const last = prev[prev.length - 1];
  const duplicate =
    last &&
    last.step === step.step &&
    last.status === step.status &&
    last.toolName === step.toolName &&
    last.errorMessage === step.errorMessage;
  return duplicate ? prev : [...prev, step];
}

function mergeAssistantText(chatMode: ChatMode, prev: string, chunk: string): string {
  const merged = stripKnowledgeMetaFromText(`${prev}${chunk}`);
  if (chatMode === CHAT_MODE.AGENT) {
    return stripAgentStreamDecorations(merged);
  }
  return merged;
}

function finalizeAssistantText(chatMode: ChatMode, raw: string): string {
  const cleaned = stripKnowledgeMetaFromText(raw || '');
  if (chatMode === CHAT_MODE.AGENT) {
    return stripAgentStreamDecorations(cleaned);
  }
  return cleaned;
}

function resolveFallbackTitleId(chatMode: ChatMode): string {
  if (chatMode === CHAT_MODE.AGENT) {
    return 'chat.fallbackTitle.agent';
  }
  if (chatMode === CHAT_MODE.REQUIREMENT_DEV) {
    return 'chat.fallbackTitle.requirementDev';
  }
  return 'chat.fallbackTitle.knowledge';
}

export function useChatStream(chatMode: ChatMode) {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { conversationId, setConversationId, pendingScrollMessageId } = useChatSession();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const sendingRef = useRef(false);
  const conversationRef = useRef(conversationId);
  const assistantMetaRef = useRef<ConversationMessage['meta']>();
  const assistantArtifactsRef = useRef<ChatArtifactPayload[]>([]);

  conversationRef.current = conversationId;

  const language = intl.locale.startsWith('en') ? 'en' : 'zh';
  const fallbackTitle = intl.formatMessage({ id: resolveFallbackTitleId(chatMode) });

  useEffect(() => {
    setMessages([]);
    setIsLoadingHistory(true);
    let alive = true;
    void fetchNormalizedMessages(conversationId)
      .then((nextMessages) => {
        if (alive && conversationRef.current === conversationId) {
          setMessages(nextMessages);
        }
      })
      .finally(() => {
        if (alive && conversationRef.current === conversationId) {
          setIsLoadingHistory(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!pendingScrollMessageId) {
      return;
    }
    let alive = true;
    setIsLoadingHistory(true);
    void fetchNormalizedMessages(conversationId)
      .then((nextMessages) => {
        if (alive && conversationRef.current === conversationId) {
          setMessages(nextMessages);
        }
      })
      .finally(() => {
        if (alive && conversationRef.current === conversationId) {
          setIsLoadingHistory(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [pendingScrollMessageId, conversationId]);

  const sendMessage = useCallback(
    async (
      rawMessage: string,
      options?: { sessionVariables?: Record<string, string> },
    ) => {
      const message = rawMessage.trim();
      if (!message || sendingRef.current) {
        return;
      }
      sendingRef.current = true;

      const activeConversationId = conversationRef.current;
      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;
      const nextMessages: ConversationMessage[] = [
        ...messages,
        { id: userMessageId, role: 'user', kind: 'text', text: message },
        { id: assistantMessageId, role: 'assistant', kind: 'text', text: '', pending: true },
      ];

      setIsSending(true);
      setMessages(nextMessages);
      assistantMetaRef.current = undefined;
      assistantArtifactsRef.current = [];

      void ensureConversationOnServer({
        conversationId: activeConversationId,
        chatMode,
        message,
        fallbackTitle,
      }).catch(() => undefined);

      try {
        await sendChatByMode(
          {
            conversationId: activeConversationId,
            message,
            language,
            mode: chatMode,
            sessionVariables: options?.sessionVariables,
          },
          {
            onChunk: (chunk) => {
              setMessages((current) =>
                current.map((item) => {
                  if (item.id !== assistantMessageId) {
                    return item;
                  }
                  let agentProgress = item.agentProgress ?? [];
                  if (chatMode === CHAT_MODE.AGENT) {
                    for (const step of extractProgressFromText(chunk)) {
                      agentProgress = appendAgentProgressStep(agentProgress, step);
                    }
                  }
                  return {
                    ...item,
                    text: mergeAssistantText(chatMode, item.text || '', chunk),
                    agentProgress,
                    pending: true,
                  };
                }),
              );
            },
            onMeta: (meta) => {
              if (!meta) {
                return;
              }
              if ('type' in meta && meta.type === 'meta') {
                const superMeta = meta as SuperAgentMetaEvent;
                if (superMeta.text2sqlSessionId || superMeta.modelName || superMeta.routingModelName) {
                  assistantMetaRef.current = {
                    ...(assistantMetaRef.current || {}),
                    ...(superMeta.text2sqlSessionId
                      ? { text2sqlSessionId: superMeta.text2sqlSessionId }
                      : {}),
                    ...(superMeta.modelName ? { modelName: superMeta.modelName } : {}),
                    ...(superMeta.routingModelName
                      ? { routingModelName: superMeta.routingModelName }
                      : {}),
                  };
                  setMessages((current) =>
                    current.map((item) =>
                      item.id === assistantMessageId
                        ? { ...item, meta: assistantMetaRef.current }
                        : item,
                    ),
                  );
                }
                return;
              }
              if ('event' in meta && meta.event !== 'meta') {
                return;
              }
              const knowledgeMeta = meta as KnowledgeChatMeta;
              assistantMetaRef.current = {
                ...(assistantMetaRef.current || {}),
                knowledgeBaseCount: knowledgeMeta.knowledgeBaseCount,
                knowledgeBaseNames: knowledgeMeta.knowledgeBaseNames,
                citations: knowledgeMeta.citations,
              };
              setMessages((current) =>
                current.map((item) =>
                  item.id === assistantMessageId
                    ? {
                        ...item,
                        meta: assistantMetaRef.current,
                      }
                    : item,
                ),
              );
            },
            onProgress:
              chatMode === CHAT_MODE.AGENT
                ? (event: SuperAgentProgressEvent) => {
                    const step: AgentProgressStep = {
                      step: event.step,
                      status: event.status,
                      thought: event.thought,
                      toolName: event.toolName,
                      toolResultSummary: event.toolResultSummary,
                      errorMessage: event.errorMessage,
                    };
                    setMessages((current) =>
                      current.map((item) => {
                        if (item.id !== assistantMessageId) {
                          return item;
                        }
                        return {
                          ...item,
                          agentProgress: appendAgentProgressStep(item.agentProgress ?? [], step),
                        };
                      }),
                    );
                  }
                : undefined,
            onArtifact:
              chatMode === CHAT_MODE.AGENT
                ? (event: SuperAgentArtifactEvent) => {
                    assistantArtifactsRef.current = [
                      ...assistantArtifactsRef.current,
                      event.artifact,
                    ];
                    assistantMetaRef.current = {
                      ...(assistantMetaRef.current || {}),
                      artifacts: assistantArtifactsRef.current as unknown as Array<
                        Record<string, unknown>
                      >,
                    };
                    setMessages((current) =>
                      current.map((item) =>
                        item.id === assistantMessageId
                          ? { ...item, meta: assistantMetaRef.current }
                          : item,
                      ),
                    );
                  }
                : undefined,
            onComplete: async (finalText) => {
              const cleanedText = finalizeAssistantText(chatMode, finalText || '');
              setMessages((current) =>
                current.map((item) =>
                  item.id === assistantMessageId
                    ? { ...item, pending: false, text: cleanedText || item.text }
                    : item,
                ),
              );

              try {
                if (chatMode !== CHAT_MODE.KNOWLEDGE) {
                  await persistAgentTurn({
                    conversationId: activeConversationId,
                    chatMode,
                    message,
                    fallbackTitle,
                    userMessageId,
                    assistantMessageId,
                    assistantText: cleanedText,
                    meta: assistantMetaRef.current,
                  });
                }
                await queryClient.invalidateQueries({ queryKey: conversationHistoryKey(chatMode) });
              } catch {
                // UI 仍展示本地消息
              }
            },
          },
        );
      } catch {
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMessageId
              ? {
                  ...item,
                  text: intl.formatMessage({ id: 'chat.errorMessage' }),
                  pending: false,
                  error: true,
                }
              : item,
          ),
        );
      } finally {
        sendingRef.current = false;
        setIsSending(false);
      }
    },
    [chatMode, fallbackTitle, intl, language, messages, queryClient],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoadingHistory,
    isSending,
    sendMessage,
    conversationId,
    setConversationId,
    clearMessages,
    fallbackTitle,
    deriveTitle: (text: string) => deriveConversationTitle(text, fallbackTitle),
  };
}
