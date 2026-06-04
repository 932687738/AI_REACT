import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import { Dropdown, Input, Spin, Typography } from 'antd';
import type { InputRef } from 'antd';
import { CHAT_MODE, type ChatMode } from '@/constants/chatMode';
import { useChatSession } from '@/context/ChatSessionProvider';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { truncateTitle } from '@/utils/conversationHelpers';
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
  const { conversationId, setConversationId, startNewConversation } = useChatSession();
  const { items, isLoading, renameConversation, deleteConversation } =
    useConversationHistory(chatMode);
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

      <div className={styles.list}>
        {isLoading ? (
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
                    <span className={styles.itemTitle}>{item.title}</span>
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
