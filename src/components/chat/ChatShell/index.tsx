import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { history, useIntl } from '@umijs/max';
import { Button, Checkbox, Input, message, Tag } from 'antd';
import { AppstoreOutlined, FormOutlined, ThunderboltOutlined } from '@ant-design/icons';
import ConversationShareBar from '@/components/chat/ConversationShareBar';
import { useShareMode } from '@/context/ShareModeProvider';
import { buildConversationGroups } from '@/utils/conversationShareGroups';
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
import { listQuickCommands } from '@/services/promptMarketplaceService';
import { listPlatformAgents, previewSuperAgentChatRoute } from '@/services/platformAgentRegistryService';
import { DEFAULT_PLATFORM_AGENT_NAME } from '@/constants/platformAgents';
import type { QuickCommand } from '@/types/promptMarketplace';
import type { PlatformAgentRegistryItem } from '@/types/platformAgentRegistry';
import ChatVariableFormModal from '@/components/chat/ChatVariableFormModal';
import {
  findMissingRequiredVariables,
  getAgentSessionVariables,
  hasAgentSessionVariablesConfigured,
  mergeVariableDefaults,
  setAgentSessionVariables,
} from '@/utils/agentSessionVariables';
import type { KnowledgeCitation } from '@/openapi/typings';
import { extractRoutedAgentNameFromText } from '@/utils/agentChatDisplay';
import styles from './index.less';

// Lazy-load heavy drawers
const PromptMarketplacePage = lazy(() => import('@/pages/prompt-marketplace'));
const QuickCommandsPage = lazy(() => import('@/pages/quick-commands'));

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
  const { conversationId, pendingScrollMessageId, setPendingScrollMessageId } = useChatSession();
  const shareMode = useShareMode();
  const { messages, isLoadingHistory, isSending, sendMessage } = useChatStream(chatMode);
  const shareTargetConversationId = shareMode.active ? shareMode.conversationId : null;
  const shareActiveForConversation =
    shareTargetConversationId !== null && shareTargetConversationId === conversationId;
  const shareGroups = useMemo(
    () => (shareActiveForConversation ? buildConversationGroups(messages) : []),
    [shareActiveForConversation, messages],
  );
  const messageGroupIdMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of shareGroups) {
      for (const messageId of group.messageIds) {
        map.set(messageId, group.id);
      }
    }
    return map;
  }, [shareGroups]);
  const [inputValue, setInputValue] = useState('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [quickCommandsOpen, setQuickCommandsOpen] = useState(false);
  const [quickCommands, setQuickCommands] = useState<QuickCommand[]>([]);
  const [platformAgentName, setPlatformAgentName] = useState(DEFAULT_PLATFORM_AGENT_NAME);
  const [registeredAgents, setRegisteredAgents] = useState<PlatformAgentRegistryItem[]>([]);
  const [variableAgent, setVariableAgent] = useState<PlatformAgentRegistryItem | null>(null);
  const [variableAgentName, setVariableAgentName] = useState('');
  const [variableModalOpen, setVariableModalOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const submittingRef = useRef(false);
  const isBusy = isSending || isPreparing;

  const reloadQuickCommands = useCallback(async (agentName: string) => {
    if (!agentName) {
      setQuickCommands([]);
      return;
    }
    try {
      const items = await listQuickCommands(agentName);
      setQuickCommands(items);
    } catch {
      setQuickCommands([]);
    }
  }, []);

  useEffect(() => {
    setInputValue('');
    setActiveMessageId(null);
    setVariableAgent(null);
    setVariableAgentName('');
  }, [conversationId]);

  useEffect(() => {
    if (!shareActiveForConversation || isLoadingHistory) {
      return;
    }
    if (messages.length === 0) {
      shareMode.exit();
    }
  }, [shareActiveForConversation, isLoadingHistory, messages.length, shareMode]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Map<string, HTMLElement>>(new Map());

  const headerIds = useMemo(() => resolveHeaderIds(chatMode), [chatMode]);
  const welcomeIds = useMemo(() => resolveWelcomeIds(chatMode), [chatMode]);
  const placeholderId = useMemo(() => resolvePlaceholderId(chatMode), [chatMode]);
  const quickActionIds = useMemo(() => resolveQuickActionIds(chatMode), [chatMode]);

  const userNavItems = useMemo(() => buildUserMessageNavItems(messages), [messages]);
  const showMessageNav = userNavItems.length > 0;

  const agentVariableCount = variableAgent?.variables?.length ?? 0;
  const sessionVariablesConfigured = variableAgentName
    ? hasAgentSessionVariablesConfigured(conversationId, variableAgentName)
    : false;

  const resolveVariableAgentFromRegistry = useCallback(
    (name: string, variables?: PlatformAgentRegistryItem['variables']) => {
      const existing = registeredAgents.find((item) => item.name === name);
      const resolvedVariables = existing?.variables?.length ? existing.variables : variables;
      if (!resolvedVariables?.length) {
        return null;
      }
      if (existing) {
        return existing.variables?.length ? existing : { ...existing, variables: resolvedVariables };
      }
      return {
        name,
        displayName: name,
        status: 'active',
        version: '',
        variables: resolvedVariables,
      } satisfies PlatformAgentRegistryItem;
    },
    [registeredAgents],
  );

  const shouldPromptForVariables = useCallback(
    (agent: PlatformAgentRegistryItem) => {
      if (!agent.variables?.length) {
        return false;
      }
      if (!hasAgentSessionVariablesConfigured(conversationId, agent.name)) {
        return true;
      }
      const cached = getAgentSessionVariables(conversationId, agent.name);
      return findMissingRequiredVariables(agent.variables, cached).length > 0;
    },
    [conversationId],
  );

  useEffect(() => {
    if (chatMode !== CHAT_MODE.AGENT) {
      setQuickCommands([]);
      setRegisteredAgents([]);
      setVariableAgent(null);
      setVariableAgentName('');
      return;
    }
    listPlatformAgents()
      .then((agents) => {
        setRegisteredAgents(agents);
        const activeAgent =
          agents.find((item) => item.status === 'active') ?? agents[0];
        const resolved = activeAgent?.name ?? DEFAULT_PLATFORM_AGENT_NAME;
        setPlatformAgentName(resolved);
        return reloadQuickCommands(resolved);
      })
      .catch(() => reloadQuickCommands(DEFAULT_PLATFORM_AGENT_NAME));
  }, [chatMode, reloadQuickCommands]);

  useEffect(() => {
    if (chatMode !== CHAT_MODE.AGENT || isLoadingHistory || registeredAgents.length === 0) {
      return;
    }
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const item = messages[index];
      if (item.role !== 'assistant' || !item.text) {
        continue;
      }
      const routedName = extractRoutedAgentNameFromText(item.text);
      if (!routedName) {
        continue;
      }
      const agent = resolveVariableAgentFromRegistry(routedName);
      if (agent?.variables?.length) {
        setVariableAgent(agent);
        setVariableAgentName(agent.name);
      } else {
        setVariableAgent(null);
        setVariableAgentName('');
      }
      return;
    }
  }, [
    chatMode,
    conversationId,
    isLoadingHistory,
    messages,
    registeredAgents,
    resolveVariableAgentFromRegistry,
  ]);

  useEffect(() => {
    if (chatMode !== CHAT_MODE.AGENT || agentVariableCount === 0 || !variableAgent) {
      return;
    }
    if (sessionVariablesConfigured) {
      return;
    }
    setVariableModalOpen(true);
  }, [chatMode, agentVariableCount, conversationId, sessionVariablesConfigured, variableAgent]);

  const openVariableModal = useCallback(async () => {
    if (variableAgent?.variables?.length) {
      setVariableModalOpen(true);
      return;
    }
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const item = messages[index];
      if (item.role !== 'assistant' || !item.text) {
        continue;
      }
      const routedName = extractRoutedAgentNameFromText(item.text);
      if (!routedName) {
        continue;
      }
      const agent = resolveVariableAgentFromRegistry(routedName);
      if (agent?.variables?.length) {
        setVariableAgent(agent);
        setVariableAgentName(agent.name);
        setVariableModalOpen(true);
        return;
      }
    }
    message.info(intl.formatMessage({ id: 'chat.variables.routeFirstHint' }));
  }, [intl, messages, resolveVariableAgentFromRegistry, variableAgent]);

  useEffect(() => {
    if (!quickCommandsOpen && chatMode === CHAT_MODE.AGENT) {
      void reloadQuickCommands(platformAgentName);
    }
  }, [quickCommandsOpen, chatMode, platformAgentName, reloadQuickCommands]);

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

  useEffect(() => {
    if (!pendingScrollMessageId || isLoadingHistory) {
      return;
    }
    const targetId = pendingScrollMessageId;
    const hasMessage = messages.some((item) => item.id === targetId);
    if (!hasMessage) {
      message.warning(intl.formatMessage({ id: 'layout.search.targetMissing' }));
      setPendingScrollMessageId(null);
      return;
    }
    scrollToMessage(targetId);
    setPendingScrollMessageId(null);
  }, [
    pendingScrollMessageId,
    isLoadingHistory,
    messages,
    scrollToMessage,
    setPendingScrollMessageId,
    intl,
  ]);

  const handleCitationNavigate = useCallback((citation: KnowledgeCitation) => {
    if (!citation.knowledgeBaseId || !citation.documentId) {
      return;
    }
    history.push(
      `${ROUTES.KNOWLEDGE_UPLOAD}?kb=${encodeURIComponent(String(citation.knowledgeBaseId))}&doc=${encodeURIComponent(String(citation.documentId))}`,
    );
  }, []);

  const dispatchMessage = useCallback(
    async (message: string, sessionVariables?: Record<string, string>) => {
      await sendMessage(message, sessionVariables ? { sessionVariables } : undefined);
      scrollToBottom();
    },
    [sendMessage, scrollToBottom],
  );

  const handleSubmit = useCallback(
    async (raw?: string) => {
      const messageText = (raw ?? inputValue).trim();
      if (!messageText || submittingRef.current || isSending) {
        return;
      }
      submittingRef.current = true;
      setIsPreparing(true);
      if (raw === undefined) {
        setInputValue('');
      }

      try {
        if (chatMode === CHAT_MODE.AGENT) {
          try {
            const preview = await previewSuperAgentChatRoute({
              conversationId,
              message: messageText,
            });
            if (preview.streamRoute === 'FLOW_ENGINE' && preview.flowId) {
              message.info(`本轮路由至 AI 流程 #${preview.flowId}`);
            }
            const routedAgent = preview.subAgentName
              ? resolveVariableAgentFromRegistry(preview.subAgentName, preview.variables)
              : null;
            if (routedAgent?.variables?.length) {
              setVariableAgent(routedAgent);
              setVariableAgentName(routedAgent.name);
              if (shouldPromptForVariables(routedAgent)) {
                setPendingMessage(messageText);
                setVariableModalOpen(true);
                return;
              }
              const cached = mergeVariableDefaults(
                routedAgent.variables,
                getAgentSessionVariables(conversationId, routedAgent.name),
              );
              await dispatchMessage(messageText, cached);
              return;
            }
          } catch {
            // prep 失败时降级为无变量发送
          }
        }

        await dispatchMessage(messageText);
      } finally {
        submittingRef.current = false;
        setIsPreparing(false);
      }
    },
    [
      chatMode,
      conversationId,
      dispatchMessage,
      inputValue,
      isSending,
      resolveVariableAgentFromRegistry,
      shouldPromptForVariables,
    ],
  );

  const handleVariableModalSubmit = useCallback(
    async (values: Record<string, string>) => {
      if (!variableAgentName || submittingRef.current || isSending) {
        return;
      }
      submittingRef.current = true;
      setIsPreparing(true);
      setAgentSessionVariables(conversationId, variableAgentName, values);
      setVariableModalOpen(false);
      const messageText = pendingMessage;
      setPendingMessage(null);
      try {
        if (messageText) {
          await dispatchMessage(messageText, values);
        }
      } finally {
        submittingRef.current = false;
        setIsPreparing(false);
      }
    },
    [conversationId, dispatchMessage, isSending, pendingMessage, variableAgentName],
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
        {chatMode === CHAT_MODE.AGENT && agentVariableCount > 0 ? (
          <div className={styles.topbarActions}>
            <Tag color={sessionVariablesConfigured ? 'success' : 'warning'}>
              {intl.formatMessage(
                { id: 'chat.variables.agentTag' },
                {
                  agent: variableAgent?.displayName || variableAgentName,
                  count: agentVariableCount,
                },
              )}
            </Tag>
            <Button icon={<FormOutlined />} onClick={() => void openVariableModal()}>
              {intl.formatMessage({ id: 'chat.variables.open' })}
            </Button>
          </div>
        ) : null}
      </header>

      {messages.length === 0 ? (
        <section className={`${styles.welcome} nebula-chat-welcome`}>
          <div className={styles.welcomeMark} aria-hidden>
            N
          </div>
          <h2>{intl.formatMessage({ id: welcomeIds.title })}</h2>
          <p>{intl.formatMessage({ id: welcomeIds.body })}</p>
          {chatMode === CHAT_MODE.AGENT && agentVariableCount > 0 && !sessionVariablesConfigured ? (
            <p className={styles.variableHint}>
              {intl.formatMessage({ id: 'chat.variables.welcomeHint' })}
              <Button type="link" size="small" onClick={() => void openVariableModal()}>
                {intl.formatMessage({ id: 'chat.variables.open' })}
              </Button>
            </p>
          ) : null}
        </section>
      ) : (
        <div className={styles.thread} ref={listRef}>
          {messages.map((item) => {
            const groupId = messageGroupIdMap.get(item.id);
            const showShareCheckbox = shareActiveForConversation && Boolean(groupId);
            return (
            <article
              key={item.id}
              ref={(node) => registerMessageRef(item.id, node)}
              data-message-id={item.id}
              className={`${styles.messageRow} ${item.role === 'user' ? styles.messageRowUser : ''} ${
                activeMessageId === item.id ? styles.messageRowTarget : ''
              } ${shareActiveForConversation ? styles.messageRowShare : ''}`}
            >
              {showShareCheckbox && groupId ? (
                <Checkbox
                  className={`${styles.shareCheckbox} nebula-share-checkbox`}
                  checked={shareMode.isSelected(groupId)}
                  onChange={() => shareMode.toggleGroup(groupId)}
                  aria-label={intl.formatMessage({ id: 'chat.share.selectGroup' })}
                />
              ) : shareActiveForConversation ? (
                <span className={styles.shareCheckboxSpacer} aria-hidden />
              ) : null}
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
                    onSendUserMessage={(text) => {
                      void handleSubmit(text);
                    }}
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
          );
          })}
          <div ref={endRef} />
        </div>
      )}

      {shareActiveForConversation && shareTargetConversationId ? (
        <ConversationShareBar
          conversationId={shareTargetConversationId}
          groupIds={shareGroups.map((group) => group.id)}
          selectedGroupIds={shareMode.selectedGroupIds}
          onSelectAll={() => shareMode.selectAll(shareGroups.map((group) => group.id))}
          onClearSelection={shareMode.clearSelection}
          onCancel={shareMode.exit}
        />
      ) : null}

      {!shareActiveForConversation ? (
      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          if (!isBusy) {
            void handleSubmit();
          }
        }}
      >
        <TextArea
          key={conversationId}
          className={styles.input}
          rows={3}
          value={inputValue}
          placeholder={intl.formatMessage({ id: placeholderId })}
          disabled={isBusy}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (!isBusy) {
                void handleSubmit();
              }
            }
          }}
        />
        <div className={styles.toolbar}>
          <div className={styles.shortcuts}>
            {chatMode === CHAT_MODE.AGENT ? (
              <>
                <button
                  type="button"
                  className={styles.shortcut}
                  onClick={() => setMarketplaceOpen(true)}
                >
                  <AppstoreOutlined /> Prompt 市场
                </button>
                <button
                  type="button"
                  className={styles.shortcut}
                  onClick={() => setQuickCommandsOpen(true)}
                >
                  <ThunderboltOutlined /> 快捷指令
                </button>
                {quickCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    type="button"
                    className={styles.shortcut}
                    disabled={isBusy}
                    onClick={() => void handleSubmit(cmd.content)}
                  >
                    {cmd.icon ? `${cmd.icon} ` : ''}{cmd.name}
                  </button>
                ))}
              </>
            ) : (
              quickActionIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={styles.shortcut}
                  disabled={isBusy}
                  onClick={() => void handleSubmit(intl.formatMessage({ id }))}
                >
                  {intl.formatMessage({ id })}
                </button>
              ))
            )}
          </div>
          <Button type="primary" htmlType="submit" loading={isBusy} disabled={isBusy}>
            {isBusy
              ? intl.formatMessage({ id: 'chat.sending' })
              : intl.formatMessage({ id: 'chat.send' })}
          </Button>
        </div>
      </form>
      ) : null}
      </div>
      </div>
      {showMessageNav ? (
        <ChatSuggestRail
          items={userNavItems}
          activeMessageId={activeMessageId}
          onNavigate={scrollToMessage}
        />
      ) : null}
      <Suspense fallback={null}>
        {marketplaceOpen ? (
          <PromptMarketplacePage
            open={marketplaceOpen}
            onClose={() => setMarketplaceOpen(false)}
            agentName={platformAgentName}
          />
        ) : null}
        {quickCommandsOpen ? (
          <QuickCommandsPage
            open={quickCommandsOpen}
            onClose={() => setQuickCommandsOpen(false)}
            agentName={platformAgentName}
          />
        ) : null}
      </Suspense>
      {chatMode === CHAT_MODE.AGENT && variableAgent?.variables?.length ? (
        <ChatVariableFormModal
          open={variableModalOpen}
          agentDisplayName={variableAgent.displayName || variableAgent.name}
          variables={variableAgent.variables}
          initialValues={getAgentSessionVariables(conversationId, variableAgentName)}
          onCancel={() => {
            setVariableModalOpen(false);
            setPendingMessage(null);
          }}
          onSubmit={(values) => {
            void handleVariableModalSubmit(values);
          }}
        />
      ) : null}
    </section>
  );
}
