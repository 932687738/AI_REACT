import { useId, useMemo } from 'react'
import { messages } from '@/i18n/messages'
import { formatSimilarityPercent, normalizeCitation } from '@/utils/knowledgeCitation'

function CitationDocIcon() {
  return (
    <svg
      className="citation-source__icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M9 13h6M9 17h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function KnowledgeCitationPanel({ citations = [], language, onCitationClick }) {
  const t = messages[language]
  const panelId = useId()
  const items = useMemo(
    () => citations.map(normalizeCitation).filter(Boolean),
    [citations],
  )

  if (items.length === 0) {
    return null
  }

  const showVectorHint = items.some(
    (c) => (c.vectorScore == null || c.vectorScore === 0) && c.score > 0.05,
  )
  return (
    <details className="citation-panel" data-citation-count={items.length}>
      <summary className="citation-panel__summary" aria-controls={`${panelId}-list`}>
        <span className="citation-panel__chevron" aria-hidden="true" />
        <span className="citation-panel__title">{t.citationsLabel}</span>
        <span className="citation-panel__count" aria-label={t.citationCountLabel.replace('{count}', String(items.length))}>
          {items.length}
        </span>
      </summary>
      <ul id={`${panelId}-list`} className="citation-panel__list">
        {items.map((citation, index) => {
          const canNavigate = Boolean(
            citation.knowledgeBaseId && citation.documentId && onCitationClick,
          )
          const scorePercent = formatSimilarityPercent(citation.score) ?? '0'
          const vectorPercent = formatSimilarityPercent(citation.vectorScore)
          const rowLabel = t.citationRowAria
            .replace('{doc}', citation.documentName || t.citationUnknownDoc)
            .replace('{kb}', citation.knowledgeBaseName)
            .replace('{score}', String(scorePercent))

          const rowBody = (
            <>
              <div className="citation-source__row">
                <CitationDocIcon />
                <div className="citation-source__main">
                  <span className="citation-source__name" title={citation.documentName}>
                    {citation.documentName || t.citationUnknownDoc}
                  </span>
                  <span className="citation-source__kb">{citation.knowledgeBaseName}</span>
                </div>
                <span className="citation-source__score" title={t.citationScoreHint}>
                  {t.citationScore} {scorePercent}%
                </span>
              </div>
              <p className="citation-source__preview">{citation.preview}</p>
              {vectorPercent != null ? (
                <p className="citation-source__vector" title={t.citationVectorScoreHint}>
                  {t.citationVectorScore}: {vectorPercent}%
                </p>
              ) : null}
              {canNavigate ? (
                <span className="citation-source__cta">{t.citationViewDocument}</span>
              ) : null}
            </>
          )

          return (
            <li key={citation.chunkId ?? `${citation.documentId}-${index}`} className="citation-source">
              {canNavigate ? (
                <button
                  type="button"
                  className="citation-source__hit"
                  aria-label={rowLabel}
                  onClick={() => onCitationClick(citation)}
                >
                  {rowBody}
                </button>
              ) : (
                <div className="citation-source__static" aria-label={rowLabel}>
                  {rowBody}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {showVectorHint ? (
        <p className="citation-panel__hint">{t.citationVectorLowHint}</p>
      ) : null}
    </details>
  )
}
