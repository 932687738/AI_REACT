import { useState } from 'react';
import { useIntl } from '@umijs/max';
import { hilStep1, hilStep2 } from '@/services/humanLoopService';
import type { HilStep1Response, HilStep2Response } from '@/types/humanLoop';
import { toHumanLoopErrorMessage } from '@/types/humanLoop';
import HilEmptyHint from './HilEmptyHint';
import HilErrorAlert from './HilErrorAlert';
import styles from './humanLoop.less';

const DEFAULT_THREAD = 'demo-hil-1';

export default function DraftHilPanel() {
  const intl = useIntl();
  const [threadId, setThreadId] = useState(DEFAULT_THREAD);
  const [prompt, setPrompt] = useState('');
  const [checkpointId, setCheckpointId] = useState('');
  const [modelReply, setModelReply] = useState('');
  const [humanEditedReply, setHumanEditedReply] = useState('');
  const [finalReply, setFinalReply] = useState('');
  const [status, setStatus] = useState('');
  const [loadingStep1, setLoadingStep1] = useState(false);
  const [loadingStep2, setLoadingStep2] = useState(false);
  const [error, setError] = useState('');

  const showEmptyHint =
    !modelReply && !status && !finalReply && !error && !loadingStep1 && !loadingStep2;

  async function runStep1() {
    setLoadingStep1(true);
    setError('');
    setFinalReply('');
    try {
      const data = (await hilStep1(threadId.trim(), prompt)) as HilStep1Response;
      setCheckpointId(String(data.checkpointId ?? ''));
      setModelReply(String(data.modelReply ?? ''));
      setHumanEditedReply(String(data.modelReply ?? ''));
      setStatus(String(data.status ?? ''));
    } catch (err) {
      setError(toHumanLoopErrorMessage(err, intl.formatMessage({ id: 'hil.error' })));
    } finally {
      setLoadingStep1(false);
    }
  }

  async function runStep2() {
    setLoadingStep2(true);
    setError('');
    try {
      const data = (await hilStep2({
        threadId: threadId.trim(),
        checkpointId,
        humanEditedReply,
      })) as HilStep2Response;
      setFinalReply(String(data.finalReply ?? ''));
    } catch (err) {
      setError(toHumanLoopErrorMessage(err, intl.formatMessage({ id: 'hil.error' })));
    } finally {
      setLoadingStep2(false);
    }
  }

  return (
    <div className={styles.panel}>
      {showEmptyHint ? (
        <HilEmptyHint>{intl.formatMessage({ id: 'hil.empty.draft' })}</HilEmptyHint>
      ) : null}
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>{intl.formatMessage({ id: 'hil.threadId' })}</span>
          <input value={threadId} onChange={(event) => setThreadId(event.target.value)} />
        </label>
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>{intl.formatMessage({ id: 'hil.prompt' })}</span>
          <textarea
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={intl.formatMessage({ id: 'hil.promptPlaceholder' })}
          />
        </label>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={loadingStep1 || loadingStep2}
          onClick={() => void runStep1()}
        >
          {loadingStep1
            ? intl.formatMessage({ id: 'hil.running' })
            : intl.formatMessage({ id: 'hil.step1' })}
        </button>
      </div>
      {status ? (
        <div className={styles.result}>
          <p className={styles.resultLabel}>{intl.formatMessage({ id: 'hil.status' })}</p>
          <code>{status}</code>
        </div>
      ) : null}
      {modelReply ? (
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>{intl.formatMessage({ id: 'hil.draft' })}</span>
          <textarea
            rows={6}
            value={humanEditedReply}
            onChange={(event) => setHumanEditedReply(event.target.value)}
          />
        </label>
      ) : null}
      {modelReply ? (
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={loadingStep1 || loadingStep2}
            onClick={() => void runStep2()}
          >
            {loadingStep2
              ? intl.formatMessage({ id: 'hil.running' })
              : intl.formatMessage({ id: 'hil.step2' })}
          </button>
        </div>
      ) : null}
      {finalReply ? (
        <div className={`${styles.result} ${styles.resultSuccess}`}>
          <p className={styles.resultLabel}>{intl.formatMessage({ id: 'hil.finalReply' })}</p>
          <pre>{finalReply}</pre>
        </div>
      ) : null}
      <HilErrorAlert message={error} />
    </div>
  );
}
