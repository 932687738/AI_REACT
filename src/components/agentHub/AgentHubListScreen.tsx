import { ReloadOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Alert, Button, Input, Spin } from 'antd';
import { useMemo, useState } from 'react';
import type { AgentHubEntity } from '@/services/agentHubService';
import AgentHubEntityCard from './AgentHubEntityCard';
import styles from './agentHub.less';

function formatExampleMeta(
  examples: AgentHubEntity['examples'],
  examplesLabel: string,
): string {
  if (!examples.length) {
    return '';
  }
  const first = examples[0];
  const firstLabel = first?.title || first?.description;
  if (firstLabel) {
    return `${examplesLabel}: ${firstLabel}`;
  }
  return `${examplesLabel}: ${examples.length}`;
}

export interface AgentHubListScreenProps {
  titleId: string;
  subtitleId: string;
  emptyId: string;
  items: AgentHubEntity[];
  loading: boolean;
  isError: boolean;
  onRetry: () => void;
  typeLabel: string;
  showToolCount?: boolean;
  showSearch?: boolean;
  sectionTitleId?: string;
}

export default function AgentHubListScreen({
  titleId,
  subtitleId,
  emptyId,
  items,
  loading,
  isError,
  onRetry,
  typeLabel,
  showToolCount = false,
  showSearch = false,
  sectionTitleId,
}: AgentHubListScreenProps) {
  const intl = useIntl();
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return items;
    }
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword),
    );
  }, [items, query]);

  const examplesLabel = intl.formatMessage({ id: 'agentHub.examples' });
  const toolsLabel = intl.formatMessage({ id: 'agentHub.toolCount' });

  return (
    <section className={`${styles.screen} nebula-agent-hub-screen`}>
      {showSearch ? (
        <header className={styles.topbar}>
          <Button
            type="default"
            className={styles.refreshBtn}
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={onRetry}
          >
            {intl.formatMessage({ id: 'agentHub.refresh' })}
          </Button>
          <label className={styles.search}>
            <span aria-hidden>*</span>
            <Input
              bordered={false}
              value={query}
              placeholder={intl.formatMessage({ id: 'agentHub.searchPlaceholder' })}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={intl.formatMessage({ id: 'agentHub.searchPlaceholder' })}
            />
          </label>
        </header>
      ) : (
        <header className={styles.topbarCompact}>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={loading}
            aria-label={intl.formatMessage({ id: 'agentHub.refresh' })}
            onClick={onRetry}
          />
        </header>
      )}

      <div className={styles.header}>
        <h1>{intl.formatMessage({ id: titleId })}</h1>
        <p>{intl.formatMessage({ id: subtitleId })}</p>
      </div>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message={intl.formatMessage({ id: 'agentHub.loadFailed' })}
          action={
            <Button size="small" onClick={onRetry}>
              {intl.formatMessage({ id: 'agentHub.retry' })}
            </Button>
          }
        />
      ) : null}

      <section className={styles.section}>
        {sectionTitleId ? <h2>{intl.formatMessage({ id: sectionTitleId })}</h2> : null}
        <div className={styles.grid}>
          {loading ? (
            <div className={styles.empty}>
              <Spin tip={intl.formatMessage({ id: 'agentHub.loading' })} />
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const extraParts = [
                showToolCount ? `${toolsLabel}: ${item.toolCount}` : '',
                formatExampleMeta(item.examples, examplesLabel),
              ].filter(Boolean);
              return (
                <AgentHubEntityCard
                  key={`${typeLabel}-${item.name}`}
                  item={item}
                  typeLabel={typeLabel}
                  extraLabel={extraParts.join(' · ')}
                />
              );
            })
          ) : (
            <div className={styles.empty}>{intl.formatMessage({ id: emptyId })}</div>
          )}
        </div>
      </section>
    </section>
  );
}
