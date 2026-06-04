import { FileTextOutlined } from '@ant-design/icons';
import { useId, useMemo } from 'react';
import { useIntl } from '@umijs/max';
import type { KnowledgeCitation } from '@/openapi/typings';
import { formatSimilarityPercent, normalizeCitation } from '@/utils/KnowledgeCitation';
import styles from './KnowledgeCitationPanel.less';

interface KnowledgeCitationPanelProps {
  citations?: KnowledgeCitation[];
  onCitationClick?: (citation: KnowledgeCitation) => void;
}

export default function KnowledgeCitationPanel({
  citations = [],
  onCitationClick,
}: KnowledgeCitationPanelProps) {
  const intl = useIntl();
  const panelId = useId();
  const items = useMemo(
    () => citations.map(normalizeCitation).filter(Boolean),
    [citations],
  );

  if (items.length === 0) {
    return null;
  }

  const showVectorHint = items.some(
    (c) => (c?.vectorScore === null || c?.vectorScore === undefined || c?.vectorScore === 0) && (c?.score ?? 0) > 0.05,
  );

  return (
    <details className={styles.panel} data-citation-count={items.length}>
      <summary className={styles.summary} aria-controls={`${panelId}-list`}>
        <span className={styles.title}>{intl.formatMessage({ id: 'chat.citationsLabel' })}</span>
        <span className={styles.count}>
          {items.length}
        </span>
      </summary>
      <ul id={`${panelId}-list`} className={styles.list}>
        {items.map((citation, index) => {
          const canNavigate = Boolean(
            citation?.knowledgeBaseId && citation.documentId && onCitationClick,
          );
          const scorePercent = formatSimilarityPercent(citation?.score) ?? '0';
          const vectorPercent = formatSimilarityPercent(citation?.vectorScore);
          const documentName =
            citation?.documentName || intl.formatMessage({ id: 'chat.citationUnknownDoc' });

          const rowBody = (
            <>
              <div className={styles.row}>
                <FileTextOutlined className={styles.icon} aria-hidden />
                <div className={styles.main}>
                  <span className={styles.docName} title={documentName}>
                    {documentName}
                  </span>
                  <span className={styles.kbName}>{citation?.knowledgeBaseName}</span>
                </div>
                <span className={styles.score}>
                  {intl.formatMessage({ id: 'chat.citationScore' })} {scorePercent}%
                </span>
              </div>
              <p className={styles.preview}>{citation?.preview}</p>
              {vectorPercent !== null && vectorPercent !== undefined ? (
                <p className={styles.vector}>
                  {intl.formatMessage({ id: 'chat.citationVectorScore' })}: {vectorPercent}%
                </p>
              ) : null}
              {canNavigate ? (
                <span className={styles.cta}>
                  {intl.formatMessage({ id: 'chat.citationViewDocument' })}
                </span>
              ) : null}
            </>
          );

          return (
            <li key={citation?.chunkId ?? `${citation?.documentId}-${index}`} className={styles.item}>
              {canNavigate ? (
                <button
                  type="button"
                  className={styles.hit}
                  onClick={() => onCitationClick?.(citation!)}
                >
                  {rowBody}
                </button>
              ) : (
                <div className={styles.static}>{rowBody}</div>
              )}
            </li>
          );
        })}
      </ul>
      {showVectorHint ? (
        <p className={styles.hint}>{intl.formatMessage({ id: 'chat.citationVectorLowHint' })}</p>
      ) : null}
    </details>
  );
}
