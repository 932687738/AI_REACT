import { useMemo } from 'react';
import { useIntl } from '@umijs/max';
import type { AgentProgressStep } from '@/openapi/typings';
import styles from './index.less';

interface AgentProgressTimelineProps {
  steps: AgentProgressStep[];
  /** 已有正文时折叠为单行摘要 */
  compact?: boolean;
}

function statusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('fail') || normalized.includes('error')) {
    return styles.dotError;
  }
  if (normalized.includes('complete') || normalized.includes('done') || normalized === 'ok') {
    return styles.dotDone;
  }
  if (normalized.includes('start') || normalized.includes('running')) {
    return styles.dotActive;
  }
  return styles.dotIdle;
}

function resolveStepLabel(step: string, intl: ReturnType<typeof useIntl>): string {
  const normalized = step.trim().toLowerCase();
  const id = `chat.agentProgress.step.${normalized}`;
  const translated = intl.formatMessage({ id, defaultMessage: step });
  return translated === id ? step : translated;
}

function resolveStatusLabel(status: string, intl: ReturnType<typeof useIntl>): string {
  const normalized = status.trim().toLowerCase();
  const id = `chat.agentProgress.status.${normalized}`;
  const translated = intl.formatMessage({ id, defaultMessage: status });
  return translated === id ? status : translated;
}

export default function AgentProgressTimeline({ steps, compact = false }: AgentProgressTimelineProps) {
  const intl = useIntl();

  const visibleSteps = useMemo(
    () => steps.filter((item) => item.step || item.status),
    [steps],
  );

  if (!visibleSteps.length) {
    return null;
  }

  const last = visibleSteps[visibleSteps.length - 1];
  const lastLabel = last
    ? `${resolveStepLabel(last.step, intl)} · ${resolveStatusLabel(last.status, intl)}`
    : '';

  if (compact && lastLabel) {
    return (
      <p className={styles.compactSummary} role="status">
        <span className={styles.compactDot} aria-hidden />
        {intl.formatMessage({ id: 'chat.agentProgress.compact' }, { detail: lastLabel })}
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.title}>{intl.formatMessage({ id: 'chat.agentProgress.label' })}</p>
      <ol className={styles.timeline} aria-label={intl.formatMessage({ id: 'chat.agentProgress.label' })}>
        {visibleSteps.map((item, index) => {
          const key = `${item.step}-${item.status}-${index}`;
          const detail = item.thought || item.toolName || item.toolResultSummary;
          const isLast = index === visibleSteps.length - 1;
          return (
            <li key={key} className={styles.step}>
              <span className={styles.rail} aria-hidden>
                <span className={`${styles.dot} ${statusClass(item.status)}`} />
                {!isLast ? <span className={styles.line} /> : null}
              </span>
              <div className={styles.content}>
                <div className={styles.headline}>
                  <span className={styles.stepName}>{resolveStepLabel(item.step, intl)}</span>
                  <span className={styles.status}>{resolveStatusLabel(item.status, intl)}</span>
                </div>
                {detail ? <p className={styles.detail}>{detail}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
