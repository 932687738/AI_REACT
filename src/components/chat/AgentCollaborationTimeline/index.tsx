import { useIntl } from '@umijs/max';
import type { AgentCollaborationStep } from '@/utils/agentChatDisplay';
import styles from './index.less';

export interface AgentCollaborationTimelineProps {
  steps: AgentCollaborationStep[];
}

export default function AgentCollaborationTimeline({ steps }: AgentCollaborationTimelineProps) {
  const intl = useIntl();

  if (!steps.length) {
    return null;
  }

  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <p className={styles.title}>{intl.formatMessage({ id: 'chat.collaboration.label' })}</p>
      <ol className={styles.list} aria-label={intl.formatMessage({ id: 'chat.collaboration.label' })}>
        {steps.map((step) => (
          <li key={`${step.index}-${step.label}`} className={styles.item}>
            <span className={styles.badge}>
              {intl.formatMessage(
                { id: 'chat.collaboration.stepBadge' },
                { index: step.index, total: step.total },
              )}
            </span>
            <span className={styles.label}>{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
