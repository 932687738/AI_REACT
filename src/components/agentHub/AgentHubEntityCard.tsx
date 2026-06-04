import { useIntl } from '@umijs/max';
import type { AgentHubEntity } from '@/services/agentHubService';
import styles from './agentHub.less';

export interface AgentHubEntityCardProps {
  item: AgentHubEntity;
  typeLabel: string;
  extraLabel?: string;
}

export default function AgentHubEntityCard({ item, typeLabel, extraLabel }: AgentHubEntityCardProps) {
  const intl = useIntl();

  return (
    <article className={`${styles.card} nebula-agent-hub-card`} aria-label={item.name}>
      <div className={styles.cardIcon} aria-hidden>
        {typeLabel.slice(0, 1).toUpperCase()}
      </div>
      <div className={styles.cardBody}>
        <strong>{item.name}</strong>
        <p>{item.description || intl.formatMessage({ id: 'agentHub.emptyItem' })}</p>
        {extraLabel ? <small>{extraLabel}</small> : null}
        {item.examples.length > 0 ? (
          <ul className={styles.exampleList}>
            {item.examples.slice(0, 2).map((example) => (
              <li key={example.id}>
                {example.title || example.description || example.sample}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <span className={styles.cardStatus} aria-hidden>
        +
      </span>
    </article>
  );
}
