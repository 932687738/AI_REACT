import { ReloadOutlined } from '@ant-design/icons';
import { Button, Spin, Typography } from 'antd';
import { useIntl } from '@umijs/max';
import type { ConversationSearchHit } from '@/openapi/typings';
import { highlightSnippet } from '@/utils/highlightSnippet';
import styles from './ConversationSearchResults.less';

interface ConversationSearchResultsProps {
  keyword: string;
  items: ConversationSearchHit[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  onSelect: (item: ConversationSearchHit) => void;
}

function formatHitTime(hitAt?: number): string {
  if (!hitAt) {
    return '';
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(hitAt));
  } catch {
    return '';
  }
}

function roleLabelId(role?: string | null): string | null {
  if (role === 'user') {
    return 'layout.search.role.user';
  }
  if (role === 'assistant') {
    return 'layout.search.role.assistant';
  }
  return null;
}

export default function ConversationSearchResults({
  keyword,
  items,
  isLoading,
  isError,
  hasMore,
  onRetry,
  onLoadMore,
  onSelect,
}: ConversationSearchResultsProps) {
  const intl = useIntl();

  if (isLoading && items.length === 0) {
    return (
      <div className={styles.state}>
        <Spin size="small" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.state}>
        <Typography.Text className={styles.muted}>
          {intl.formatMessage({ id: 'layout.search.error' })}
        </Typography.Text>
        <Button size="small" type="link" icon={<ReloadOutlined />} onClick={() => onRetry()}>
          {intl.formatMessage({ id: 'layout.search.retry' })}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Typography.Text className={styles.empty}>
        {intl.formatMessage({ id: 'layout.search.empty' })}
      </Typography.Text>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => {
        const roleId = roleLabelId(item.role);
        const key = `${item.conversationId}-${item.messageId ?? 'title'}-${item.hitAt ?? 0}`;
        return (
          <button
            key={key}
            type="button"
            className={styles.item}
            onClick={() => onSelect(item)}
          >
            <span className={styles.itemTitle}>{item.title || '—'}</span>
            <span className={styles.meta}>
              {roleId ? intl.formatMessage({ id: roleId }) : intl.formatMessage({ id: 'layout.search.matchTitle' })}
              {item.hitAt ? ` · ${formatHitTime(item.hitAt)}` : ''}
            </span>
            <span className={styles.snippet}>{highlightSnippet(item.snippet ?? '', keyword)}</span>
          </button>
        );
      })}
      {hasMore ? (
        <Button size="small" type="link" className={styles.loadMore} onClick={() => onLoadMore()}>
          {intl.formatMessage({ id: 'layout.search.loadMore' })}
        </Button>
      ) : null}
      {isLoading && items.length > 0 ? (
        <div className={styles.stateInline}>
          <Spin size="small" />
        </div>
      ) : null}
    </div>
  );
}
