import { useState } from 'react'
import {
  toolFeedbackApprove,
  toolFeedbackEdit,
  toolFeedbackInvoke,
  toolFeedbackReject,
} from '@/api/humanLoop'
import HilEmptyHint from '@/components/humanLoop/HilEmptyHint'
import HilErrorAlert from '@/components/humanLoop/HilErrorAlert'
import { messages } from '@/i18n/messages'

const DEFAULT_THREAD = 'demo-tf-1'

export default function ToolFeedbackPanel({ language }) {
  const t = messages[language] ?? messages.zh
  const [threadId, setThreadId] = useState(DEFAULT_THREAD)
  const [question, setQuestion] = useState('')
  const [invokeResult, setInvokeResult] = useState(null)
  const [resumeResult, setResumeResult] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [editedArguments, setEditedArguments] = useState('')
  const [loadingInvoke, setLoadingInvoke] = useState(false)
  const [loadingResume, setLoadingResume] = useState(false)
  const [error, setError] = useState('')

  const pending = invokeResult?.pendingApprovals ?? []
  const firstTool = pending[0]
  const isBusy = loadingInvoke || loadingResume
  const showEmptyHint = !invokeResult && !resumeResult && !error && !isBusy

  async function runInvoke() {
    setLoadingInvoke(true)
    setError('')
    setResumeResult(null)
    try {
      const data = await toolFeedbackInvoke(threadId.trim(), question)
      setInvokeResult(data)
      if (data.pendingApprovals?.[0]?.arguments) {
        setEditedArguments(data.pendingApprovals[0].arguments)
      }
    } catch (err) {
      setError(err.message || t.humanReviewError)
    } finally {
      setLoadingInvoke(false)
    }
  }

  async function runShortcut(action) {
    setLoadingResume(true)
    setError('')
    try {
      let data
      if (action === 'approve') {
        data = await toolFeedbackApprove(threadId.trim())
      } else if (action === 'reject') {
        data = await toolFeedbackReject(threadId.trim(), rejectReason)
      } else {
        data = await toolFeedbackEdit(
          threadId.trim(),
          firstTool?.toolName || 'sendEmailTool',
          editedArguments,
        )
      }
      setResumeResult(data)
    } catch (err) {
      setError(err.message || t.humanReviewError)
    } finally {
      setLoadingResume(false)
    }
  }

  return (
    <div className="hil-panel">
      {showEmptyHint ? <HilEmptyHint>{t.humanReviewEmptyTool}</HilEmptyHint> : null}
      <div className="hil-form-grid">
        <label className="hil-field">
          <span>{t.humanReviewThreadId}</span>
          <input value={threadId} onChange={(e) => setThreadId(e.target.value)} />
        </label>
        <label className="hil-field hil-field--wide">
          <span>{t.humanReviewQuestion}</span>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t.humanReviewToolPlaceholder}
          />
        </label>
      </div>
      <div className="hil-actions">
        <button type="button" className="hil-btn hil-btn--primary" disabled={isBusy} onClick={runInvoke}>
          {loadingInvoke ? t.humanReviewRunning : t.humanReviewInvoke}
        </button>
      </div>
      {invokeResult ? (
        <div className="hil-result">
          <p className="hil-result__label">{t.humanReviewStatus}</p>
          <code>{invokeResult.status}</code>
          {invokeResult.assistantPreview ? <pre>{invokeResult.assistantPreview}</pre> : null}
        </div>
      ) : null}
      {pending.length > 0 ? (
        <ul className="hil-approval-list">
          {pending.map((item) => (
            <li key={item.toolCallId} className="hil-approval-card">
              <strong>{item.toolName}</strong>
              <p>{item.approvalPrompt}</p>
              <pre>{item.arguments}</pre>
            </li>
          ))}
        </ul>
      ) : null}
      {pending.length > 0 ? (
        <>
          <label className="hil-field hil-field--wide">
            <span>{t.humanReviewEditedArgs}</span>
            <textarea rows={4} value={editedArguments} onChange={(e) => setEditedArguments(e.target.value)} />
          </label>
          <label className="hil-field hil-field--wide">
            <span>{t.humanReviewRejectReason}</span>
            <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </label>
          <div className="hil-actions hil-actions--wrap">
            <button type="button" className="hil-btn" disabled={isBusy} onClick={() => runShortcut('approve')}>
              {loadingResume ? t.humanReviewRunning : t.humanReviewApprove}
            </button>
            <button type="button" className="hil-btn" disabled={isBusy} onClick={() => runShortcut('edit')}>
              {loadingResume ? t.humanReviewRunning : t.humanReviewEditRun}
            </button>
            <button type="button" className="hil-btn hil-btn--danger" disabled={isBusy} onClick={() => runShortcut('reject')}>
              {loadingResume ? t.humanReviewRunning : t.humanReviewReject}
            </button>
          </div>
        </>
      ) : null}
      {resumeResult ? (
        <div className="hil-result hil-result--success">
          <p className="hil-result__label">{t.humanReviewAssistantReply}</p>
          <pre>{resumeResult.assistantReply}</pre>
          {resumeResult.toolExecutionLogs?.length ? (
            <ul className="hil-log-list">
              {resumeResult.toolExecutionLogs.map((log) => (
                <li key={log}>{log}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <HilErrorAlert message={error} />
    </div>
  )
}
