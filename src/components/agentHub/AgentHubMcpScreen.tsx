import { ReloadOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Alert, Button, Spin, Tag } from 'antd';
import { useMemo } from 'react';
import type { AgentHubMcpCallback, AgentHubMcpProvider } from '@/services/agentHubService';
import AgentHubEntityCard from './AgentHubEntityCard';
import styles from './agentHub.less';

export interface AgentHubMcpScreenProps {
  providers: AgentHubMcpProvider[];
  callbacks: AgentHubMcpCallback[];
  loading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function formatCallbackChips(item: AgentHubMcpCallback, intl: ReturnType<typeof useIntl>): string[] {
  const chips: string[] = [];
  if (item.providerBean) {
    chips.push(`${intl.formatMessage({ id: 'agentHub.mcp.provider' })} · ${item.providerBean}`);
  }
  if (item.transport) {
    chips.push(item.transport);
  }
  if (item.permissionTag) {
    chips.push(
      `${intl.formatMessage({ id: 'agentHub.mcp.permissionTag' })} · ${item.permissionTag}`,
    );
  }
  return chips;
}

export default function AgentHubMcpScreen({
  providers,
  callbacks,
  loading,
  isError,
  onRetry,
}: AgentHubMcpScreenProps) {
  const intl = useIntl();

  const hasProviders = providers.length > 0;
  const hasCallbacks = callbacks.length > 0;

  const providerRows = useMemo(
    () =>
      providers.map((provider) => ({
        ...provider,
        key: `provider-${provider.name}-${provider.transport}`,
      })),
    [providers],
  );

  return (
    <section className={`${styles.screen} nebula-agent-hub-screen`}>
      <header className={styles.topbarCompact}>
        <Button
          type="text"
          icon={<ReloadOutlined />}
          loading={loading}
          aria-label={intl.formatMessage({ id: 'agentHub.refresh' })}
          onClick={onRetry}
        />
      </header>

      <div className={styles.header}>
        <h1>{intl.formatMessage({ id: 'agentHub.mcp.title' })}</h1>
        <p>{intl.formatMessage({ id: 'agentHub.mcp.subtitle' })}</p>
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
        <h2>{intl.formatMessage({ id: 'agentHub.mcp.providersTitle' })}</h2>
        <div className={styles.catalogGrid}>
          {loading ? (
            <div className={styles.empty}>
              <Spin tip={intl.formatMessage({ id: 'agentHub.loading' })} />
            </div>
          ) : hasProviders ? (
            providerRows.map((provider) => (
              <article
                key={provider.key}
                className={`${styles.card} ${styles.providerCard} nebula-agent-hub-card`}
                aria-label={provider.name}
              >
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon} aria-hidden>
                    M
                  </div>
                  <span className={styles.cardTitle}>{provider.name}</span>
                </div>
                <div className={styles.cardDescWrap}>
                  <p className={styles.cardDesc} title={provider.endpoint}>
                    {provider.endpoint || intl.formatMessage({ id: 'agentHub.mcp.noEndpoint' })}
                  </p>
                </div>
                <footer className={styles.cardFooter}>
                  <span className={`${styles.chip} ${styles.chipAccent}`}>{provider.transport}</span>
                  <span className={styles.chip}>
                    {intl.formatMessage({ id: 'agentHub.mcp.toolCount' }, { count: provider.toolCount })}
                  </span>
                  <Tag color={provider.ready ? 'success' : 'warning'} style={{ margin: 0 }}>
                    {provider.ready
                      ? intl.formatMessage({ id: 'agentHub.mcp.ready' })
                      : intl.formatMessage({ id: 'agentHub.mcp.notReady' })}
                  </Tag>
                </footer>
              </article>
            ))
          ) : (
            <div className={styles.empty}>{intl.formatMessage({ id: 'agentHub.mcp.providersEmpty' })}</div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2>{intl.formatMessage({ id: 'agentHub.mcp.callbacksTitle' })}</h2>
        <div className={styles.catalogGrid}>
          {loading ? (
            <div className={styles.empty}>
              <Spin tip={intl.formatMessage({ id: 'agentHub.loading' })} />
            </div>
          ) : hasCallbacks ? (
            callbacks.map((item) => (
              <AgentHubEntityCard
                key={`mcp-${item.name}`}
                item={item}
                typeLabel="mcp"
                chips={formatCallbackChips(item, intl)}
                extraTags={
                  item.highRisk
                    ? [
                        {
                          key: 'high-risk',
                          color: 'error' as const,
                          label: intl.formatMessage({ id: 'agentHub.mcp.highRisk' }),
                        },
                      ]
                    : undefined
                }
              />
            ))
          ) : (
            <div className={styles.empty}>{intl.formatMessage({ id: 'agentHub.mcp.empty' })}</div>
          )}
        </div>
      </section>
    </section>
  );
}

