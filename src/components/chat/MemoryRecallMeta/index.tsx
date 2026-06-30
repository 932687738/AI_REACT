import { useIntl } from '@umijs/max';
import styles from './index.less';

export interface MemoryRecallMetaProps {
  longCount?: number;
  shortCount?: number;
}

export default function MemoryRecallMeta({ longCount = 0, shortCount = 0 }: MemoryRecallMetaProps) {
  const intl = useIntl();

  if (!longCount && !shortCount) {
    return null;
  }

  return (
    <p className={styles.wrap} role="note">
      <span className={styles.icon} aria-hidden>
        ◈
      </span>
      {intl.formatMessage({ id: 'chat.memory.recallSummary' }, { longCount, shortCount })}
    </p>
  );
}
