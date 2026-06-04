import { SlidersOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, InputNumber, Modal, Slider, message } from 'antd';
import { useEffect, useState } from 'react';
import {
  getKnowledgeRetrievalThreshold,
  saveKnowledgeRetrievalThreshold,
} from '@/services/conversationConfigService';
import styles from './retrievalThreshold.less';

const DEFAULT_PERCENT = 50;

function clampPercent(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

export default function RetrievalThresholdSettings() {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [savedRelevance, setSavedRelevance] = useState(DEFAULT_PERCENT);
  const [savedVector, setSavedVector] = useState(DEFAULT_PERCENT);
  const [draftRelevance, setDraftRelevance] = useState(DEFAULT_PERCENT);
  const [draftVector, setDraftVector] = useState(DEFAULT_PERCENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const data = await getKnowledgeRetrievalThreshold();
        if (cancelled) {
          return;
        }
        const relevance = data.minRelevancePercent ?? DEFAULT_PERCENT;
        const vector = data.minVectorSimilarityPercent ?? DEFAULT_PERCENT;
        setSavedRelevance(relevance);
        setSavedVector(vector);
        setDraftRelevance(relevance);
        setDraftVector(vector);
      } catch {
        if (!cancelled) {
          setError(intl.formatMessage({ id: 'settings.retrieval.loadFailed' }));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [intl]);

  function openModal() {
    setDraftRelevance(savedRelevance);
    setDraftVector(savedVector);
    setError('');
    setOpen(true);
  }

  function closeModal() {
    setDraftRelevance(savedRelevance);
    setDraftVector(savedVector);
    setError('');
    setOpen(false);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const data = await saveKnowledgeRetrievalThreshold({
        minRelevancePercent: draftRelevance,
        minVectorSimilarityPercent: draftVector,
      });
      const relevance = data.minRelevancePercent ?? draftRelevance;
      const vector = data.minVectorSimilarityPercent ?? draftVector;
      setSavedRelevance(relevance);
      setSavedVector(vector);
      setDraftRelevance(relevance);
      setDraftVector(vector);
      message.success(intl.formatMessage({ id: 'settings.retrieval.saveSuccess' }));
      setOpen(false);
    } catch {
      setError(intl.formatMessage({ id: 'settings.retrieval.saveFailed' }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="text"
        className={`nebula-retrieval-trigger ${styles.trigger}`}
        icon={<SlidersOutlined />}
        disabled={loading}
        aria-label={intl.formatMessage({ id: 'settings.retrieval.openAria' })}
        title={intl.formatMessage(
          { id: 'settings.retrieval.summary' },
          { relevance: savedRelevance, vector: savedVector },
        )}
        onClick={openModal}
      />
      <Modal
        open={open}
        title={intl.formatMessage({ id: 'settings.retrieval.title' })}
        onCancel={closeModal}
        footer={[
          <Button key="reset" disabled={saving} onClick={() => {
            setDraftRelevance(DEFAULT_PERCENT);
            setDraftVector(DEFAULT_PERCENT);
            setError('');
          }}>
            {intl.formatMessage({ id: 'settings.retrieval.reset' })}
          </Button>,
          <Button key="cancel" disabled={saving} onClick={closeModal}>
            {intl.formatMessage({ id: 'settings.retrieval.cancel' })}
          </Button>,
          <Button key="save" type="primary" loading={saving} disabled={loading} onClick={() => void handleSave()}>
            {intl.formatMessage({ id: 'settings.retrieval.save' })}
          </Button>,
        ]}
        destroyOnClose
      >
        <p className={styles.intro}>{intl.formatMessage({ id: 'settings.retrieval.intro' })}</p>

        <div className={styles.field}>
          <div className={styles.fieldHead}>
            <label htmlFor="retrieval-relevance">{intl.formatMessage({ id: 'settings.retrieval.relevanceLabel' })}</label>
            <InputNumber
              id="retrieval-relevance"
              min={0}
              max={100}
              value={draftRelevance}
              disabled={loading || saving}
              onChange={(value) => setDraftRelevance(clampPercent(Number(value ?? 0)))}
            />
          </div>
          <Slider
            min={0}
            max={100}
            value={draftRelevance}
            disabled={loading || saving}
            onChange={(value) => setDraftRelevance(clampPercent(value))}
          />
          <p className={styles.hint}>{intl.formatMessage({ id: 'settings.retrieval.relevanceHint' })}</p>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldHead}>
            <label htmlFor="retrieval-vector">{intl.formatMessage({ id: 'settings.retrieval.vectorLabel' })}</label>
            <InputNumber
              id="retrieval-vector"
              min={0}
              max={100}
              value={draftVector}
              disabled={loading || saving}
              onChange={(value) => setDraftVector(clampPercent(Number(value ?? 0)))}
            />
          </div>
          <Slider
            min={0}
            max={100}
            value={draftVector}
            disabled={loading || saving}
            onChange={(value) => setDraftVector(clampPercent(value))}
          />
          <p className={styles.hint}>{intl.formatMessage({ id: 'settings.retrieval.vectorHint' })}</p>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
      </Modal>
    </>
  );
}
