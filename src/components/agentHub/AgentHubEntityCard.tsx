import { useIntl } from '@umijs/max';
import { Tag } from 'antd';
import type { AgentHubEntity } from '@/services/agentHubService';
import styles from './agentHub.less';

export interface AgentHubEntityCardProps {
  item: AgentHubEntity;
  typeLabel: string;
  /** 底部标签（模块、Bean、Provider 等） */
  chips?: string[];
  /** 卡片标题旁额外 Tag（如 MCP 高危） */
  extraTags?: Array<{ key: string; color?: 'error' | 'warning' | 'success'; label: string }>;
}

export default function AgentHubEntityCard({
  item,
  typeLabel,
  chips = [],
  extraTags,
}: AgentHubEntityCardProps) {
  const intl = useIntl();
  const description = item.description || intl.formatMessage({ id: 'agentHub.emptyItem' });
  const exampleCount = item.examples.length;

  return (
    <article className={`${styles.card} nebula-agent-hub-card`} aria-label={item.name}>
      <div className={styles.cardHead}>
        <div className={styles.cardIcon} aria-hidden>
          {typeLabel.slice(0, 1).toUpperCase()}
        </div>
        <span className={styles.cardTitle}>{item.name}</span>
        {extraTags?.map((tag) => (
          <Tag key={tag.key} color={tag.color} style={{ margin: 0 }}>
            {tag.label}
          </Tag>
        ))}
      </div>

      <div className={styles.cardDescWrap}>
        <p className={styles.cardDesc} title={description}>
          {description}
        </p>
      </div>

      {(chips.length > 0 || exampleCount > 0) && (
        <footer className={styles.cardFooter}>
          {chips.map((chip) => (
            <span key={chip} className={styles.chip} title={chip}>
              {chip}
            </span>
          ))}
          {exampleCount > 0 ? (
            <span className={`${styles.chip} ${styles.chipMuted}`}>
              {intl.formatMessage({ id: 'agentHub.exampleCount' }, { count: exampleCount })}
            </span>
          ) : null}
        </footer>
      )}
    </article>
  );
}

