import styles from './humanLoop.less';

export interface HilFactItem {
  key?: string;
  label: string;
  value?: string | number | boolean | null;
  variant?: 'success' | 'warning';
}

export default function HilResultFacts({ title, items }: { title?: string; items: HilFactItem[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className={styles.facts}>
      {title ? <p className={styles.factsTitle}>{title}</p> : null}
      <dl className={styles.factsList}>
        {items.map((item) => (
          <div
            key={item.key ?? item.label}
            className={`${styles.factsRow} ${
              item.variant === 'success'
                ? styles.factsRowSuccess
                : item.variant === 'warning'
                  ? styles.factsRowWarning
                  : ''
            }`}
          >
            <dt>{item.label}</dt>
            <dd>{item.value === null || item.value === undefined || item.value === '' ? '—' : String(item.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
