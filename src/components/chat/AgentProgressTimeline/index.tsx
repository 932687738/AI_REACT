import { useMemo } from 'react';
import { useIntl } from '@umijs/max';
import type { AgentProgressStep } from '@/openapi/typings';
import styles from './index.less';

interface AgentProgressTimelineProps {
  steps: AgentProgressStep[];
}

function statusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('fail') || normalized.includes('error')) {
    return styles.statusError;
  }
  if (normalized.includes('complete') || normalized.includes('done') || normalized === 'ok') {
    return styles.statusDone;
  }
  if (normalized.includes('start') || normalized.includes('running')) {
    return styles.statusActive;
  }
  return styles.statusIdle;
}

export default function AgentProgressTimeline({ steps }: AgentProgressTimelineProps) {
  const intl = useIntl();

  const visibleSteps = useMemo(
    () => steps.filter((item) => item.step || item.status),
    [steps],
  );

  if (!visibleSteps.length) {
    return null;
  }

  return (
    <ol className={styles.timeline} aria-label={intl.formatMessage({ id: 'chat.agentProgress.label' })}>
      {visibleSteps.map((item, index) => {
        const key = `${item.step}-${item.status}-${index}`;
        const detail = item.thought || item.toolName || item.toolResultSummary;
        return (
          <li key={key} className={styles.step}>
            <span className={`${styles.badge} ${statusClass(item.status)}`}>
              {item.status || '—'}
            </span>
            <span className={styles.stepName}>{item.step}</span>
            {detail ? <span className={styles.detail}>{detail}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
