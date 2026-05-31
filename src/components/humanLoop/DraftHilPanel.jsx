import { useState } from 'react'
import { hilStep1, hilStep2 } from '@/api/humanLoop'
import HilEmptyHint from '@/components/humanLoop/HilEmptyHint'
import HilErrorAlert from '@/components/humanLoop/HilErrorAlert'
import { messages } from '@/i18n/messages'

const DEFAULT_THREAD = 'demo-hil-1'

export default function DraftHilPanel({ language }) {
  const t = messages[language] ?? messages.zh
  const [threadId, setThreadId] = useState(DEFAULT_THREAD)
  const [prompt, setPrompt] = useState('')
  const [checkpointId, setCheckpointId] = useState('')
  const [modelReply, setModelReply] = useState('')
  const [humanEditedReply, setHumanEditedReply] = useState('')
  const [finalReply, setFinalReply] = useState('')
  const [status, setStatus] = useState('')
  const [loadingStep1, setLoadingStep1] = useState(false)
  const [loadingStep2, setLoadingStep2] = useState(false)
  const [error, setError] = useState('')

  const showEmptyHint = !modelReply && !status && !finalReply && !error && !loadingStep1 && !loadingStep2

  async function runStep1() {
    setLoadingStep1(true)
    setError('')
    setFinalReply('')
    try {
      const data = await hilStep1(threadId.trim(), prompt)
      setCheckpointId(data.checkpointId ?? '')
      setModelReply(data.modelReply ?? '')
      setHumanEditedReply(data.modelReply ?? '')
      setStatus(data.status ?? '')
    } catch (err) {
      setError(err.message || t.humanReviewError)
    } finally {
      setLoadingStep1(false)
    }
  }

  async function runStep2() {
    setLoadingStep2(true)
    setError('')
    try {
      const data = await hilStep2({
        threadId: threadId.trim(),
        checkpointId,
        humanEditedReply,
      })
      setFinalReply(data.finalReply ?? '')
    } catch (err) {
      setError(err.message || t.humanReviewError)
    } finally {
      setLoadingStep2(false)
    }
  }

  return (
    <div className="hil-panel">
      {showEmptyHint ? <HilEmptyHint>{t.humanReviewEmptyDraft}</HilEmptyHint> : null}
      <div className="hil-form-grid">
        <label className="hil-field">
          <span>{t.humanReviewThreadId}</span>
          <input value={threadId} onChange={(e) => setThreadId(e.target.value)} />
        </label>
        <label className="hil-field hil-field--wide">
          <span>{t.humanReviewPrompt}</span>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.humanReviewPromptPlaceholder}
          />
        </label>
      </div>
      <div className="hil-actions">
        <button
          type="button"
          className="hil-btn hil-btn--primary"
          disabled={loadingStep1 || loadingStep2}
          onClick={runStep1}
        >
          {loadingStep1 ? t.humanReviewRunning : t.humanReviewStep1}
        </button>
      </div>
      {status ? (
        <div className="hil-result">
          <p className="hil-result__label">{t.humanReviewStatus}</p>
          <code>{status}</code>
        </div>
      ) : null}
      {modelReply ? (
        <label className="hil-field hil-field--wide">
          <span>{t.humanReviewDraft}</span>
          <textarea rows={6} value={humanEditedReply} onChange={(e) => setHumanEditedReply(e.target.value)} />
        </label>
      ) : null}
      {modelReply ? (
        <div className="hil-actions">
          <button
            type="button"
            className="hil-btn hil-btn--primary"
            disabled={loadingStep1 || loadingStep2}
            onClick={runStep2}
          >
            {loadingStep2 ? t.humanReviewRunning : t.humanReviewStep2}
          </button>
        </div>
      ) : null}
      {finalReply ? (
        <div className="hil-result hil-result--success">
          <p className="hil-result__label">{t.humanReviewFinalReply}</p>
          <pre>{finalReply}</pre>
        </div>
      ) : null}
      <HilErrorAlert message={error} />
    </div>
  )
}
