import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { history, useIntl } from '@umijs/max';
import { Button, Input } from 'antd';
import { CHAT_MODE, type ChatMode } from '@/constants/chatMode';
import { ROUTES } from '@/constants/routes';
import AgentAssistantMessageContent from '@/components/chat/AgentAssistantMessageContent';
import ChatSuggestRail from '@/components/chat/ChatSuggestRail';
import { resolveQuickActionIds } from '@/components/chat/chatQuickActions';
import KnowledgeCitationPanel from '@/components/chat/KnowledgeCitationPanel';
import TypewriterText from '@/components/chat/TypewriterText';
import { buildUserMessageNavItems } from '@/utils/chatUserMessageNav';
import { scrollThreadToMessage } from '@/utils/scrollThreadToMessage';
import RetrievalThresholdSettings from '@/components/settings/RetrievalThresholdSettings';
import { useChatSession } from '@/context/ChatSessionProvider';
import { useChatStream } from '@/hooks/useChatStream';
import type { KnowledgeCitation } from '@/openapi/typings';
import styles from './index.less';

const { TextArea } = Input;

interface ChatShellProps {
  chatMode: ChatMode;
}

function resolveHeaderIds(chatMode: ChatMode) {
  if (chatMode === CHAT_MODE.KNOWLEDGE) {
    return { title: 'chat.header.knowledge.title', subtitle: 'chat.header.knowledge.subtitle' };
  }
  if (chatMode === CHAT_MODE.REQUIREMENT_DEV) {
    return {
      title: 'chat.header.requirementDev.title',
      subtitle: 'chat.header.requirementDev.subtitle',
    };
  }
  return { title: 'chat.header.agent.title', subtitle: 'chat.header.agent.subtitle' };
}

function resolveWelcomeIds(chatMode: ChatMode) {
  if (chatMode === CHAT_MODE.KNOWLEDGE) {
    return { title: 'chat.welcome.knowledge.title', body: 'chat.welcome.knowledge.body' };
  }
  if (chatMode === CHAT_MODE.REQUIREMENT_DEV) {
    return {
      title: 'chat.welcome.requirementDev.title',
      body: 'chat.welcome.requirementDev.body',
    };
  }
  return { title: 'chat.welcome.agent.title', body: 'chat.welcome.agent.body' };
}

function resolvePlaceholderId(chatMode: ChatMode) {
  if (chatMode === CHAT_MODE.KNOWLEDGE) {
    return 'chat.placeholder.knowledge';
  }
  if (chatMode === CHAT_MODE.REQUIREMENT_DEV) {
    return 'chat.placeholder.requirementDev';
  }
  return 'chat.placeholder.agent';
}

export default function ChatShell({ chatMode }: ChatShellProps) {
  const intl = useIntl();
  const { conversationId } = useChatSession();
  const { messages, isSending, sendMessage } = useChatStream(chatMode);
  const [inputValue, setInputValue] = useState('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  useEffect(() => {
    setInputValue('');
    setActiveMessageId(null);
  }, [conversationId]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Map<string, HTMLElement>>(new Map());

  const headerIds = useMemo(() => resolveHeaderIds(chatMode), [chatMode]);
  const welcomeIds = useMemo(() => resolveWelcomeIds(chatMode), [chatMode]);
  const placeholderId = useMemo(() => resolvePlaceholderId(chatMode), [chatMode]);
  const quickActionIds = useMemo(() => resolveQuickActionIds(chatMode), [chatMode]);

  const userNavItems = useMemo(() => buildUserMessageNavItems(messages), [messages]);
  const showMessageNav = userNavItems.length > 0;

  const registerMessageRef = useCallback((messageId: string, node: HTMLElement | null) => {
    if (node) {
      messageRefs.current.set(messageId, node);
      return;
    }
    messageRefs.current.delete(messageId);
  }, []);

  const scrollToMessage = useCallback((messageId: string) => {
    const container = listRef.current;
    if (!container) {
      return;
    }

    const target =
      messageRefs.current.get(messageId) ??
      (container.querySelector(`[data-message-id="${messageId}"]`) as HTMLElement | null);

    if (!target) {
      return;
    }

    setActiveMessageId(messageId);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    requestAnimationFrame(() => {
      scrollThreadToMessage(container, target, prefersReducedMotion ? 'auto' : 'smooth');
      requestAnimationFrame(() => {
        scrollThreadToMessage(container, target, prefersReducedMotion ? 'auto' : 'smooth');
      });
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ block: 'end' });
    });
  }, []);

  const handleCitationNavigate = useCallback((citation: KnowledgeCitation) => {
    if (!citation.knowledgeBaseId || !citation.documentId) {
      return;
    }
    history.push(
      `${ROUTES.KNOWLEDGE_UPLOAD}?kb=${encodeURIComponent(String(citation.knowledgeBaseId))}&doc=${encodeURIComponent(String(citation.documentId))}`,
    );
  }, []);

  const handleSubmit = useCallback(
    async (raw?: string) => {
      const message = (raw ?? inputValue).trim();
      if (!message) {
        return;
      }
      setInputValue('');
      await sendMessage(message);
      scrollToBottom();
    },
    [inputValue, sendMessage, scrollToBottom],
  );

  return (
    <section className={`${styles.shell} nebula-chat-shell`}>
      <div className={styles.canvas}>
      <div className={styles.stage}>
      <header className={`${styles.topbar} nebula-chat-topbar`}>
        <div>
          <h1>{intl.formatMessage({ id: headerIds.title })}</h1>
          <p>{intl.formatMessage({ id: headerIds.subtitle })}</p>
        </div>
        {chatMode === CHAT_MODE.KNOWLEDGE ? <RetrievalThresholdSettings /> : null}
      </header>

      {messages.length === 0 ? (
        <section className={`${styles.welcome} nebula-chat-welcome`}>
          <div className={styles.welcomeMark} aria-hidden>
            N
          </div>
          <h2>{intl.formatMessage({ id: welcomeIds.title })}</h2>
          <p>{intl.formatMessage({ id: welcomeIds.body })}</p>
        </section>
      ) : (
        <div className={styles.thread} ref={listRef}>
          {messages.map((item) => (
            <article
              key={item.id}
              ref={(node) => registerMessageRef(item.id, node)}
              data-message-id={item.id}
              className={`${styles.messageRow} ${item.role === 'user' ? styles.messageRowUser : ''} ${
                activeMessageId === item.id ? styles.messageRowTarget : ''
              }`}
            >
              <div
                className={`${styles.bubble} nebula-chat-bubble ${
                  item.role === 'user'
                    ? `${styles.bubbleUser} nebula-chat-bubble-user`
                    : `${styles.bubbleAssistant} nebula-chat-bubble-assistant`
                } ${item.error ? styles.bubbleError : ''}`}
              >
                {item.role === 'assistant' && chatMode === CHAT_MODE.AGENT ? (
                  <AgentAssistantMessageContent
                    item={item}
                    scrollToBottom={scrollToBottom}
                    onCitationNavigate={handleCitationNavigate}
                  />
                ) : item.role === 'assistant' && (item.text || item.pending) ? (
                  <>
                    <TypewriterText
                      text={item.text}
                      active={Boolean(item.pending)}
                      onReveal={scrollToBottom}
                    />
                    {item.meta?.knowledgeBaseCount ? (
                      <div className={styles.meta}>
                        {intl.formatMessage(
                          { id: 'chat.kbSourcesLabel' },
                          { count: item.meta.knowledgeBaseCount },
                        )}
                        {item.meta.knowledgeBaseNames?.length
                          ? `: ${item.meta.knowledgeBaseNames.join(', ')}`
                          : ''}
                      </div>
                    ) : null}
                    {item.meta?.citations?.length ? (
                      <KnowledgeCitationPanel
                        citations={item.meta.citations}
                        onCitationClick={handleCitationNavigate}
                      />
                    ) : null}
                  </>
                ) : item.text ? (
                  <div className={styles.plainText}>{item.text}</div>
                ) : null}
              </div>
            </article>
          ))}
          <div ref={endRef} />
        </div>
      )}

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <TextArea
          key={conversationId}
          className={styles.input}
          rows={3}
          value={inputValue}
          placeholder={intl.formatMessage({ id: placeholderId })}
          disabled={isSending}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
        />
        <div className={styles.toolbar}>
          <div className={styles.shortcuts}>
            {quickActionIds.map((id) => (
              <button
                key={id}
                type="button"
                className={styles.shortcut}
                disabled={isSending}
                onClick={() => void handleSubmit(intl.formatMessage({ id }))}
              >
                {intl.formatMessage({ id })}
              </button>
            ))}
          </div>
          <Button type="primary" htmlType="submit" loading={isSending} disabled={isSending}>
            {isSending
              ? intl.formatMessage({ id: 'chat.sending' })
              : intl.formatMessage({ id: 'chat.send' })}
          </Button>
        </div>
      </form>
      </div>
      </div>
      {showMessageNav ? (
        <ChatSuggestRail
          items={userNavItems}
          activeMessageId={activeMessageId}
          onNavigate={scrollToMessage}
        />
      ) : null}
    </section>
  );
}
