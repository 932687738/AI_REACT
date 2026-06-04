import { useState } from 'react'
import {
  enterpriseContractReview,
  enterpriseEcommerceCs,
  enterprisePublishingStep1,
  enterprisePublishingStep2,
} from '@/api/humanLoop'
import HilEmptyHint from '@/components/humanLoop/HilEmptyHint'
import HilErrorAlert from '@/components/humanLoop/HilErrorAlert'
import HilResultFacts from '@/components/humanLoop/HilResultFacts'
import { messages } from '@/i18n/messages'

function formatMillis(ms, t) {
  if (ms == null || Number.isNaN(ms)) {
    return '—'
  }
  return `${ms} ${t.humanReviewElapsedUnit}`
}

function riskVariant(level) {
  if (!level) {
    return undefined
  }
  return level === 'HAS_RISK' ? 'warning' : 'success'
}

function publishVariant(status) {
  if (!status) {
    return undefined
  }
  if (status.includes('REJECT') || status.includes('INTERRUPT')) {
    return 'warning'
  }
  if (status.includes('PUBLISH') || status.includes('COMPLETED')) {
    return 'success'
  }
  return undefined
}

export default function EnterpriseWorkflowPanel({ language }) {
  const t = messages[language] ?? messages.zh
  const [contractText, setContractText] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [pubThreadId, setPubThreadId] = useState('pub-1')
  const [hotKeywords, setHotKeywords] = useState('Spring AI,Graph,工作流')
  const [humanApproved, setHumanApproved] = useState(true)
  const [humanComment, setHumanComment] = useState('')
  const [contractResult, setContractResult] = useState(null)
  const [csResult, setCsResult] = useState(null)
  const [pubStep1, setPubStep1] = useState(null)
  const [pubStep2, setPubStep2] = useState(null)
  const [loadingKey, setLoadingKey] = useState('')
  const [error, setError] = useState('')

  const showEmptyHint =
    !contractResult && !csResult && !pubStep1 && !pubStep2 && !error && !loadingKey

  async function run(key, fn) {
    setLoadingKey(key)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err.message || t.humanReviewError)
    } finally {
      setLoadingKey('')
    }
  }

  return (
    <div className="hil-panel hil-panel--stack">
      {showEmptyHint ? <HilEmptyHint>{t.humanReviewEmptyEnterprise}</HilEmptyHint> : null}

      <section className="hil-section hil-section--card">
        <h3>{t.humanReviewContractTitle}</h3>
        <label className="hil-field hil-field--wide">
          <span>{t.humanReviewContractInput}</span>
          <textarea rows={3} value={contractText} onChange={(e) => setContractText(e.target.value)} />
        </label>
        <button
          type="button"
          className="hil-btn hil-btn--primary"
          disabled={loadingKey === 'contract'}
          onClick={() =>
            run('contract', async () => {
              setContractResult(await enterpriseContractReview(contractText))
            })
          }
        >
          {loadingKey === 'contract' ? t.humanReviewRunning : t.humanReviewRun}
        </button>
        {contractResult ? (
          <HilResultFacts
            title={t.humanReviewResultContract}
            items={[
              { label: t.humanReviewFactStatus, value: contractResult.status, variant: publishVariant(contractResult.status) },
              { label: t.humanReviewFactRiskLevel, value: contractResult.riskLevel, variant: riskVariant(contractResult.riskLevel) },
              { label: t.humanReviewFactRiskDetails, value: contractResult.riskDetails },
              { label: t.humanReviewFactAuditReport, value: contractResult.auditReport },
              { label: t.humanReviewFactStructuredText, value: contractResult.structuredText },
              { label: t.humanReviewFactElapsed, value: formatMillis(contractResult.elapsedMillis, t) },
            ]}
          />
        ) : null}
      </section>

      <section className="hil-section hil-section--card">
        <h3>{t.humanReviewCsTitle}</h3>
        <label className="hil-field hil-field--wide">
          <span>{t.humanReviewCsInput}</span>
          <textarea rows={2} value={userMessage} onChange={(e) => setUserMessage(e.target.value)} />
        </label>
        <button
          type="button"
          className="hil-btn hil-btn--primary"
          disabled={loadingKey === 'cs'}
          onClick={() =>
            run('cs', async () => {
              setCsResult(await enterpriseEcommerceCs(userMessage))
            })
          }
        >
          {loadingKey === 'cs' ? t.humanReviewRunning : t.humanReviewRun}
        </button>
        {csResult ? (
          <HilResultFacts
            title={t.humanReviewResultCs}
            items={[
              { label: t.humanReviewFactIntent, value: csResult.intent },
              { label: t.humanReviewFactProductHit, value: csResult.productKbHit },
              { label: t.humanReviewFactPolicyHit, value: csResult.policyKbHit },
              { label: t.humanReviewFactFinalReply, value: csResult.finalReply },
              { label: t.humanReviewFactElapsed, value: formatMillis(csResult.elapsedMillis, t) },
            ]}
          />
        ) : null}
      </section>

      <section className="hil-section hil-section--card">
        <h3>{t.humanReviewPublishingTitle}</h3>
        <div className="hil-form-grid">
          <label className="hil-field">
            <span>{t.humanReviewThreadId}</span>
            <input value={pubThreadId} onChange={(e) => setPubThreadId(e.target.value)} />
          </label>
          <label className="hil-field hil-field--wide">
            <span>{t.humanReviewHotKeywords}</span>
            <input value={hotKeywords} onChange={(e) => setHotKeywords(e.target.value)} />
          </label>
        </div>
        <button
          type="button"
          className="hil-btn hil-btn--primary"
          disabled={loadingKey === 'pub1'}
          onClick={() =>
            run('pub1', async () => {
              setPubStep2(null)
              setPubStep1(await enterprisePublishingStep1(pubThreadId.trim(), hotKeywords))
            })
          }
        >
          {loadingKey === 'pub1' ? t.humanReviewRunning : t.humanReviewPublishingStep1}
        </button>
        {pubStep1 ? (
          <HilResultFacts
            title={t.humanReviewResultPublishingStep1}
            items={[
              { label: t.humanReviewFactStatus, value: pubStep1.status, variant: publishVariant(pubStep1.status) },
              { label: t.humanReviewFactSelectedTitle, value: pubStep1.selectedTitle },
              { label: t.humanReviewFactArticleDraft, value: pubStep1.articleDraft },
              { label: t.humanReviewFactSuspectedWords, value: pubStep1.suspectedWords, variant: pubStep1.suspectedWords ? 'warning' : undefined },
              { label: t.humanReviewFactPublishLog, value: pubStep1.publishLog },
              { label: t.humanReviewFactNextStep, value: pubStep1.nextStepHint },
            ]}
          />
        ) : null}
        {pubStep1?.status?.includes('INTERRUPTED') ? (
          <>
            <label className="hil-field">
              <span>{t.humanReviewHumanApproved}</span>
              <select
                value={humanApproved ? 'true' : 'false'}
                onChange={(e) => setHumanApproved(e.target.value === 'true')}
              >
                <option value="true">{t.humanReviewYes}</option>
                <option value="false">{t.humanReviewNo}</option>
              </select>
            </label>
            <label className="hil-field hil-field--wide">
              <span>{t.humanReviewHumanComment}</span>
              <input value={humanComment} onChange={(e) => setHumanComment(e.target.value)} />
            </label>
            <button
              type="button"
              className="hil-btn hil-btn--primary"
              disabled={loadingKey === 'pub2'}
              onClick={() =>
                run('pub2', async () => {
                  setPubStep2(
                    await enterprisePublishingStep2({
                      threadId: pubThreadId.trim(),
                      checkpointId: pubStep1.checkpointId ?? '',
                      humanApproved,
                      humanComment,
                    }),
                  )
                })
              }
            >
              {loadingKey === 'pub2' ? t.humanReviewRunning : t.humanReviewPublishingStep2}
            </button>
          </>
        ) : null}
        {pubStep2 ? (
          <HilResultFacts
            title={t.humanReviewResultPublishingStep2}
            items={[
              { label: t.humanReviewFactPublishStatus, value: pubStep2.publishStatus, variant: publishVariant(pubStep2.publishStatus) },
              { label: t.humanReviewFactPublishLog, value: pubStep2.publishLog },
            ]}
          />
        ) : null}
      </section>
      <HilErrorAlert message={error} />
    </div>
  )
}
