import { useEffect, useId, useRef, useState } from 'react'
import {
  fetchKnowledgeRetrievalThreshold,
  saveKnowledgeRetrievalThreshold,
} from '@/api/conversationConfig'
import { messages } from '@/i18n/messages'

const DEFAULT_PERCENT = 50

function ThresholdIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M4 14h3.5M4 10h7M4 18h5.5M14 8v8M18 6v12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function RetrievalThresholdSettings({ language }) {
  const t = messages[language]
  const dialogRef = useRef(null)
  const titleId = useId()
  const descId = useId()

  const [savedRelevance, setSavedRelevance] = useState(DEFAULT_PERCENT)
  const [savedVector, setSavedVector] = useState(DEFAULT_PERCENT)
  const [draftRelevance, setDraftRelevance] = useState(DEFAULT_PERCENT)
  const [draftVector, setDraftVector] = useState(DEFAULT_PERCENT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchKnowledgeRetrievalThreshold()
        if (cancelled) {
          return
        }
        const relevance = data.minRelevancePercent ?? DEFAULT_PERCENT
        const vector = data.minVectorSimilarityPercent ?? DEFAULT_PERCENT
        setSavedRelevance(relevance)
        setSavedVector(vector)
        setDraftRelevance(relevance)
        setDraftVector(vector)
      } catch {
        if (!cancelled) {
          setError(t.retrievalThresholdLoadFailed)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [t.retrievalThresholdLoadFailed])

  function openDialog() {
    setDraftRelevance(savedRelevance)
    setDraftVector(savedVector)
    setError('')
    dialogRef.current?.showModal()
  }

  function closeDialog() {
    dialogRef.current?.close()
  }

  function handleCancel() {
    setDraftRelevance(savedRelevance)
    setDraftVector(savedVector)
    setError('')
    closeDialog()
  }

  function clampPercent(value) {
    if (Number.isNaN(value)) {
      return 0
    }
    return Math.min(100, Math.max(0, Math.round(value)))
  }

  function updateDraftRelevance(value) {
    setDraftRelevance(clampPercent(value))
  }

  function updateDraftVector(value) {
    setDraftVector(clampPercent(value))
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        minRelevancePercent: draftRelevance,
        minVectorSimilarityPercent: draftVector,
      }
      const data = await saveKnowledgeRetrievalThreshold(payload)
      const relevance = data.minRelevancePercent ?? draftRelevance
      const vector = data.minVectorSimilarityPercent ?? draftVector
      setSavedRelevance(relevance)
      setSavedVector(vector)
      setDraftRelevance(relevance)
      setDraftVector(vector)
      closeDialog()
    } catch {
      setError(t.retrievalThresholdSaveFailed)
    } finally {
      setSaving(false)
    }
  }

  function handleResetDraft() {
    setDraftRelevance(DEFAULT_PERCENT)
    setDraftVector(DEFAULT_PERCENT)
    setError('')
  }

  return (
    <>
      <button
        type="button"
        className="retrieval-threshold-trigger"
        onClick={openDialog}
        disabled={loading}
        aria-haspopup="dialog"
        aria-label={t.retrievalThresholdOpenAria}
        title={t.retrievalThresholdTitle}
      >
        <ThresholdIcon />
      </button>

      <dialog
        ref={dialogRef}
        className="retrieval-threshold-dialog"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onCancel={(event) => {
          event.preventDefault()
          handleCancel()
        }}
      >
        <form className="retrieval-threshold-dialog__panel" onSubmit={handleSave}>
          <header className="retrieval-threshold-dialog__header">
            <div>
              <h2 id={titleId} className="retrieval-threshold-dialog__title">
                {t.retrievalThresholdTitle}
              </h2>
              <p id={descId} className="retrieval-threshold-dialog__intro">
                {t.retrievalThresholdIntro}
              </p>
            </div>
            <button
              type="button"
              className="retrieval-threshold-dialog__close"
              onClick={handleCancel}
              aria-label={t.retrievalThresholdClose}
            >
              ×
            </button>
          </header>

          <div className="retrieval-threshold-field">
            <div className="retrieval-threshold-field__head">
              <label htmlFor="retrieval-relevance">{t.retrievalThresholdRelevanceLabel}</label>
              <div className="retrieval-threshold-field__controls">
                <input
                  id="retrieval-relevance"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={draftRelevance}
                  disabled={loading || saving}
                  onChange={(event) => updateDraftRelevance(Number(event.target.value))}
                  className="retrieval-threshold-field__number"
                  aria-describedby="retrieval-relevance-hint"
                />
                <span className="retrieval-threshold-field__unit">%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={draftRelevance}
              disabled={loading || saving}
              onChange={(event) => updateDraftRelevance(Number(event.target.value))}
              aria-label={t.retrievalThresholdRelevanceLabel}
              className="retrieval-threshold-field__range"
            />
            <p id="retrieval-relevance-hint" className="retrieval-threshold-field__hint">
              {t.retrievalThresholdRelevanceHint}
            </p>
          </div>

          <div className="retrieval-threshold-field">
            <div className="retrieval-threshold-field__head">
              <label htmlFor="retrieval-vector">{t.retrievalThresholdVectorLabel}</label>
              <div className="retrieval-threshold-field__controls">
                <input
                  id="retrieval-vector"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={draftVector}
                  disabled={loading || saving}
                  onChange={(event) => updateDraftVector(Number(event.target.value))}
                  className="retrieval-threshold-field__number"
                  aria-describedby="retrieval-vector-hint"
                />
                <span className="retrieval-threshold-field__unit">%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={draftVector}
              disabled={loading || saving}
              onChange={(event) => updateDraftVector(Number(event.target.value))}
              aria-label={t.retrievalThresholdVectorLabel}
              className="retrieval-threshold-field__range"
            />
            <p id="retrieval-vector-hint" className="retrieval-threshold-field__hint">
              {t.retrievalThresholdVectorHint}
            </p>
          </div>

          {error ? <p className="retrieval-threshold-dialog__error">{error}</p> : null}

          <footer className="retrieval-threshold-dialog__actions">
            <button
              type="button"
              className="retrieval-threshold-dialog__secondary"
              onClick={handleResetDraft}
              disabled={saving}
            >
              {t.retrievalThresholdReset}
            </button>
            <button
              type="button"
              className="retrieval-threshold-dialog__secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              {t.retrievalThresholdCancel}
            </button>
            <button type="submit" className="retrieval-threshold-dialog__primary" disabled={loading || saving}>
              {saving ? t.saving : t.retrievalThresholdSave}
            </button>
          </footer>
        </form>
      </dialog>
    </>
  )
}

export default RetrievalThresholdSettings
