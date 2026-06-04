import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { history, useIntl } from '@umijs/max';
import { Button, Input } from 'antd';
import { CHAT_MODE, type ChatMode } from '@/constants/chatMode';
import { ROUTES } from '@/constants/routes';
import AgentProgressTimeline from '@/components/chat/AgentProgressTimeline';
import KnowledgeCitationPanel from '@/components/chat/KnowledgeCitationPanel';
import TypewriterText from '@/components/chat/TypewriterText';
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

function resolveQuickActionIds(chatMode: ChatMode) {
  if (chatMode === CHAT_MODE.REQUIREMENT_DEV) {
    return [
      'chat.quick.pmLogin',
      'chat.quick.pmOrder',
      'chat.quick.pmDashboard',
      'chat.quick.more',
    ];
  }
  return ['chat.quick.fast', 'chat.quick.code', 'chat.quick.write', 'chat.quick.music', 'chat.quick.more'];
}

export default function ChatShell({ chatMode }: ChatShellProps) {
  const intl = useIntl();
  const { conversationId } = useChatSession();
  const { messages, isSending, sendMessage } = useChatStream(chatMode);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInputValue('');
  }, [conversationId]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const headerIds = useMemo(() => resolveHeaderIds(chatMode), [chatMode]);
  const welcomeIds = useMemo(() => resolveWelcomeIds(chatMode), [chatMode]);
  const placeholderId = useMemo(() => resolvePlaceholderId(chatMode), [chatMode]);
  const quickActionIds = useMemo(() => resolveQuickActionIds(chatMode), [chatMode]);

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
              className={`${styles.messageRow} ${item.role === 'user' ? styles.messageRowUser : ''}`}
            >
              <div
                className={`${styles.bubble} nebula-chat-bubble ${
                  item.role === 'user'
                    ? `${styles.bubbleUser} nebula-chat-bubble-user`
                    : `${styles.bubbleAssistant} nebula-chat-bubble-assistant`
                } ${item.error ? styles.bubbleError : ''}`}
              >
                {item.role === 'assistant' &&
                chatMode === CHAT_MODE.AGENT &&
                item.agentProgress?.length ? (
                  <AgentProgressTimeline steps={item.agentProgress} />
                ) : null}
                {item.role === 'assistant' && (item.text || item.pending) ? (
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
    </section>
  );
}
