import { useIntl } from '@umijs/max';
import type { AgentRoutingDisplay } from '@/utils/agentChatDisplay';
import styles from './index.less';

export interface AgentRoutingMetaProps {
  routing: AgentRoutingDisplay;
}

export default function AgentRoutingMeta({ routing }: AgentRoutingMetaProps) {
  const intl = useIntl();

  return (
    <div className={styles.routing} role="status" aria-live="polite">
      <span className={styles.kicker}>{intl.formatMessage({ id: 'chat.routing.kicker' })}</span>
      <dl className={styles.grid}>
        <div className={styles.row}>
          <dt>{intl.formatMessage({ id: 'chat.routing.agent' })}</dt>
          <dd>{routing.agentLabel}</dd>
        </div>
        <div className={styles.row}>
          <dt>{intl.formatMessage({ id: 'chat.routing.skill' })}</dt>
          <dd>{routing.skillLabel}</dd>
        </div>
        <div className={styles.row}>
          <dt>{intl.formatMessage({ id: 'chat.routing.tools' })}</dt>
          <dd>{routing.toolsLabel}</dd>
        </div>
      </dl>
    </div>
  );
}
