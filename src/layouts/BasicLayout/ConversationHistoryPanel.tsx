import { MoreOutlined, PlusOutlined, PushpinFilled } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import { Dropdown, Input, Spin, Typography, message } from 'antd';
import type { InputRef } from 'antd';
import { CHAT_MODE, type ChatMode } from '@/constants/chatMode';
import { useChatSession } from '@/context/ChatSessionProvider';
import { useShareMode } from '@/context/ShareModeProvider';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { useConversationSearch } from '@/hooks/useConversationSearch';
import { checkConversationExists } from '@/services/conversationService';
import type { ConversationSearchHit } from '@/openapi/typings';
import { truncateTitle } from '@/utils/conversationHelpers';
import ConversationSearchBox from './ConversationSearchBox';
import ConversationSearchResults from './ConversationSearchResults';
import styles from './ConversationHistoryPanel.less';

interface ConversationHistoryPanelProps {
  chatMode: ChatMode;
}

function modeBadgeId(chatMode: ChatMode): string {
  if (chatMode === CHAT_MODE.AGENT) {
    return 'layout.history.mode.agent';
  }
  if (chatMode === CHAT_MODE.REQUIREMENT_DEV) {
    return 'layout.history.mode.requirementDev';
  }
  return 'layout.history.mode.knowledge';
}

export default function ConversationHistoryPanel({
  chatMode,
}: ConversationHistoryPanelProps) {
  const intl = useIntl();
  const { conversationId, setConversationId, setPendingScrollMessageId, startNewConversation } =
    useChatSession();
  const shareMode = useShareMode();
  const { items, isLoading, renameConversation, pinConversation, deleteConversation } =
    useConversationHistory(chatMode);
  const [searchQuery, setSearchQuery] = useState('');
  const searchActive = searchQuery.trim().length > 0;
  const searchDisabled = shareMode.active;
  const {
    debouncedQuery,
    items: searchItems,
    isLoading: isSearchLoading,
    isError: isSearchError,
    hasMore,
    fetchMore,
    refetch: refetchSearch,
  } = useConversationSearch(chatMode, searchQuery);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  const handleSelect = (id: string) => {
    setConversationId(id);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleSearchSelect = async (hit: ConversationSearchHit) => {
    const targetConversationId = hit.conversationId;
    if (!targetConversationId) {
      return;
    }

    try {
      const { exists } = await checkConversationExists(targetConversationId);
      if (!exists) {
        message.warning(intl.formatMessage({ id: 'layout.search.targetMissing' }));
        void refetchSearch();
        return;
      }
    } catch {
      message.warning(intl.formatMessage({ id: 'layout.search.targetMissing' }));
      void refetchSearch();
      return;
    }

    setConversationId(targetConversationId);
    setPendingScrollMessageId(hit.messageId ?? null);
  };

  const handleRenameCommit = async (id: string) => {
    const nextTitle =
      truncateTitle(renameValue, 24) ||
      intl.formatMessage({ id: 'layout.sidebar.noHistory' });
    try {
      await renameConversation({ id, title: nextTitle });
    } catch {
      // 本地乐观更新由 refresh 处理
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation(id);
      if (searchActive) {
        void refetchSearch();
      }
    } catch {
      // ignore
    }
    if (conversationId === id) {
      startNewConversation();
    }
  };

  return (
    <section className={styles.panel} aria-label={intl.formatMessage({ id: 'layout.sidebar.recentChats' })}>
      <div className={styles.header}>
        <Typography.Text className={styles.title}>
          {intl.formatMessage({ id: 'layout.sidebar.recentChats' })}
        </Typography.Text>
        <button
          type="button"
          className={styles.newChat}
          aria-label={intl.formatMessage({ id: 'layout.history.newChat' })}
          onClick={() => startNewConversation()}
        >
          <PlusOutlined aria-hidden />
        </button>
      </div>

      {!searchDisabled ? (
        <ConversationSearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleSearchClear}
        />
      ) : null}

      <div className={searchActive ? styles.listSearch : styles.list}>
        {searchActive ? (
          <ConversationSearchResults
            keyword={debouncedQuery}
            items={searchItems}
            isLoading={isSearchLoading}
            isError={isSearchError}
            hasMore={hasMore}
            onRetry={() => void refetchSearch()}
            onLoadMore={() => void fetchMore()}
            onSelect={(item) => void handleSearchSelect(item)}
          />
        ) : isLoading ? (
          <div className={styles.loading}>
            <Spin size="small" />
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className={styles.row}>
              {renamingId === item.id ? (
                <Input
                  ref={renameInputRef}
                  size="small"
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  onBlur={() => void handleRenameCommit(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void handleRenameCommit(item.id);
                    }
                    if (event.key === 'Escape') {
                      setRenamingId(null);
                      setRenameValue('');
                    }
                  }}
                />
              ) : (
                <>
                  <button
                    type="button"
                    className={`${styles.item} ${conversationId === item.id ? styles.itemActive : ''}`}
                    onClick={() => handleSelect(item.id)}
                  >
                    <span className={styles.modeBadge}>
                      {intl.formatMessage({ id: modeBadgeId(chatMode) })}
                    </span>
                    <span className={styles.itemTitle}>
                      {item.pinned ? <PushpinFilled className={styles.pinMark} aria-hidden /> : null}
                      {item.title}
                    </span>
                  </button>
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items: [
                        {
                          key: 'rename',
                          label: intl.formatMessage({ id: 'layout.history.rename' }),
                          onClick: () => {
                            setRenamingId(item.id);
                            setRenameValue(item.title || '');
                          },
                        },
                        {
                          key: 'pin',
                          label: intl.formatMessage({
                            id: item.pinned ? 'layout.history.unpin' : 'layout.history.pin',
                          }),
                          onClick: () => void pinConversation({ id: item.id, pinned: !item.pinned }),
                        },
                        {
                          key: 'share',
                          label: intl.formatMessage({ id: 'layout.history.share' }),
                          onClick: () => {
                            shareMode.enter(item.id);
                            setConversationId(item.id);
                          },
                        },
                        {
                          key: 'delete',
                          label: intl.formatMessage({ id: 'layout.history.delete' }),
                          onClick: () => void handleDelete(item.id),
                        },
                      ],
                    }}
                  >
                    <button
                      type="button"
                      className={styles.more}
                      aria-label={intl.formatMessage({ id: 'layout.history.more' })}
                    >
                      <MoreOutlined aria-hidden />
                    </button>
                  </Dropdown>
                </>
              )}
            </div>
          ))
        ) : (
          <Typography.Text className={styles.empty}>
            {intl.formatMessage({ id: 'layout.sidebar.noHistory' })}
          </Typography.Text>
        )}
      </div>
    </section>
  );
}
