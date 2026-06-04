import type { ReactNode } from 'react';
import styles from './humanLoop.less';

export default function HilEmptyHint({ children }: { children: ReactNode }) {
  return <p className={styles.emptyHint}>{children}</p>;
}
