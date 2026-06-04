import { useState } from 'react';
import { useIntl } from '@umijs/max';
import {
  toolFeedbackApprove,
  toolFeedbackEdit,
  toolFeedbackInvoke,
  toolFeedbackReject,
} from '@/services/humanLoopService';
import type {
  ToolFeedbackInvokeResponse,
  ToolFeedbackResumeResponse,
} from '@/types/humanLoop';
import { toHumanLoopErrorMessage } from '@/types/humanLoop';
import HilEmptyHint from './HilEmptyHint';
import HilErrorAlert from './HilErrorAlert';
import styles from './humanLoop.less';

const DEFAULT_THREAD = 'demo-tf-1';

export default function ToolFeedbackPanel() {
  const intl = useIntl();
  const [threadId, setThreadId] = useState(DEFAULT_THREAD);
  const [question, setQuestion] = useState('');
  const [invokeResult, setInvokeResult] = useState<ToolFeedbackInvokeResponse | null>(null);
  const [resumeResult, setResumeResult] = useState<ToolFeedbackResumeResponse | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editedArguments, setEditedArguments] = useState('');
  const [loadingInvoke, setLoadingInvoke] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);
  const [error, setError] = useState('');

  const pending = invokeResult?.pendingApprovals ?? [];
  const firstTool = pending[0];
  const isBusy = loadingInvoke || loadingResume;
  const showEmptyHint = !invokeResult && !resumeResult && !error && !isBusy;

  async function runInvoke() {
    setLoadingInvoke(true);
    setError('');
    setResumeResult(null);
    try {
      const data = (await toolFeedbackInvoke(threadId.trim(), question)) as ToolFeedbackInvokeResponse;
      setInvokeResult(data);
      if (data.pendingApprovals?.[0]?.arguments) {
        setEditedArguments(String(data.pendingApprovals[0].arguments));
      }
    } catch (err) {
      setError(toHumanLoopErrorMessage(err, intl.formatMessage({ id: 'hil.error' })));
    } finally {
      setLoadingInvoke(false);
    }
  }

  async function runShortcut(action: 'approve' | 'reject' | 'edit') {
    setLoadingResume(true);
    setError('');
    try {
      let data: ToolFeedbackResumeResponse;
      if (action === 'approve') {
        data = (await toolFeedbackApprove(threadId.trim())) as ToolFeedbackResumeResponse;
      } else if (action === 'reject') {
        data = (await toolFeedbackReject(
          threadId.trim(),
          rejectReason,
        )) as ToolFeedbackResumeResponse;
      } else {
        data = (await toolFeedbackEdit(
          threadId.trim(),
          firstTool?.toolName || 'sendEmailTool',
          editedArguments,
        )) as ToolFeedbackResumeResponse;
      }
      setResumeResult(data);
    } catch (err) {
      setError(toHumanLoopErrorMessage(err, intl.formatMessage({ id: 'hil.error' })));
    } finally {
      setLoadingResume(false);
    }
  }

  return (
    <div className={styles.panel}>
      {showEmptyHint ? (
        <HilEmptyHint>{intl.formatMessage({ id: 'hil.empty.tool' })}</HilEmptyHint>
      ) : null}
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>{intl.formatMessage({ id: 'hil.threadId' })}</span>
          <input value={threadId} onChange={(event) => setThreadId(event.target.value)} />
        </label>
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>{intl.formatMessage({ id: 'hil.question' })}</span>
          <textarea
            rows={3}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={intl.formatMessage({ id: 'hil.toolPlaceholder' })}
          />
        </label>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={isBusy}
          onClick={() => void runInvoke()}
        >
          {loadingInvoke
            ? intl.formatMessage({ id: 'hil.running' })
            : intl.formatMessage({ id: 'hil.invoke' })}
        </button>
      </div>
      {invokeResult ? (
        <div className={styles.result}>
          <p className={styles.resultLabel}>{intl.formatMessage({ id: 'hil.status' })}</p>
          <code>{String(invokeResult.status ?? '')}</code>
          {invokeResult.assistantPreview ? <pre>{String(invokeResult.assistantPreview)}</pre> : null}
        </div>
      ) : null}
      {pending.length > 0 ? (
        <ul className={styles.approvalList}>
          {pending.map((item) => (
            <li key={item.toolCallId ?? item.toolName} className={styles.approvalCard}>
              <strong>{item.toolName}</strong>
              <p>{item.approvalPrompt}</p>
              <pre>{item.arguments}</pre>
            </li>
          ))}
        </ul>
      ) : null}
      {pending.length > 0 ? (
        <>
          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>{intl.formatMessage({ id: 'hil.editedArgs' })}</span>
            <textarea
              rows={4}
              value={editedArguments}
              onChange={(event) => setEditedArguments(event.target.value)}
            />
          </label>
          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>{intl.formatMessage({ id: 'hil.rejectReason' })}</span>
            <input value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} disabled={isBusy} onClick={() => void runShortcut('approve')}>
              {loadingResume
                ? intl.formatMessage({ id: 'hil.running' })
                : intl.formatMessage({ id: 'hil.approve' })}
            </button>
            <button type="button" className={styles.btn} disabled={isBusy} onClick={() => void runShortcut('edit')}>
              {loadingResume
                ? intl.formatMessage({ id: 'hil.running' })
                : intl.formatMessage({ id: 'hil.editRun' })}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              disabled={isBusy}
              onClick={() => void runShortcut('reject')}
            >
              {loadingResume
                ? intl.formatMessage({ id: 'hil.running' })
                : intl.formatMessage({ id: 'hil.reject' })}
            </button>
          </div>
        </>
      ) : null}
      {resumeResult ? (
        <div className={`${styles.result} ${styles.resultSuccess}`}>
          <p className={styles.resultLabel}>{intl.formatMessage({ id: 'hil.assistantReply' })}</p>
          <pre>{String(resumeResult.assistantReply ?? '')}</pre>
          {resumeResult.toolExecutionLogs?.length ? (
            <ul className={styles.logList}>
              {resumeResult.toolExecutionLogs.map((log) => (
                <li key={log}>{log}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <HilErrorAlert message={error} />
    </div>
  );
}
