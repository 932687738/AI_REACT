import { useCallback, useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import {
  enterpriseContractReview,
  enterpriseEcommerceCs,
  enterprisePublishingStep1,
  enterprisePublishingStep2,
} from '@/services/humanLoopService';
import type {
  EnterpriseContractResponse,
  EnterpriseCsResponse,
  EnterprisePublishingStep1Response,
  EnterprisePublishingStep2Response,
} from '@/types/humanLoop';
import { toHumanLoopErrorMessage } from '@/types/humanLoop';
import HilEmptyHint from './HilEmptyHint';
import HilErrorAlert from './HilErrorAlert';
import HilResultFacts from './HilResultFacts';
import styles from './humanLoop.less';

function formatMillis(ms: number | undefined, unit: string): string {
  if (ms === null || ms === undefined || Number.isNaN(ms)) {
    return '—';
  }
  return `${ms} ${unit}`;
}

function riskVariant(level: string | undefined): 'warning' | 'success' | undefined {
  if (!level) {
    return undefined;
  }
  return level === 'HAS_RISK' ? 'warning' : 'success';
}

function publishVariant(status: string | undefined): 'warning' | 'success' | undefined {
  if (!status) {
    return undefined;
  }
  if (status.includes('REJECT') || status.includes('INTERRUPT')) {
    return 'warning';
  }
  if (status.includes('PUBLISH') || status.includes('COMPLETED')) {
    return 'success';
  }
  return undefined;
}

const SCENARIOS = [
  { id: 'contract', labelId: 'hil.contractTitle', panelId: 'hil-enterprise-contract' },
  { id: 'cs', labelId: 'hil.csTitle', panelId: 'hil-enterprise-cs' },
  { id: 'publishing', labelId: 'hil.publishingTitle', panelId: 'hil-enterprise-publishing' },
] as const;

type ScenarioId = (typeof SCENARIOS)[number]['id'];

export default function EnterpriseWorkflowPanel() {
  const intl = useIntl();
  const elapsedUnit = intl.formatMessage({ id: 'hil.elapsedUnit' });

  const [contractText, setContractText] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [pubThreadId, setPubThreadId] = useState('pub-1');
  const [hotKeywords, setHotKeywords] = useState('Spring AI,Graph,工作流');
  const [humanApproved, setHumanApproved] = useState(true);
  const [humanComment, setHumanComment] = useState('');
  const [contractResult, setContractResult] = useState<EnterpriseContractResponse | null>(null);
  const [csResult, setCsResult] = useState<EnterpriseCsResponse | null>(null);
  const [pubStep1, setPubStep1] = useState<EnterprisePublishingStep1Response | null>(null);
  const [pubStep2, setPubStep2] = useState<EnterprisePublishingStep2Response | null>(null);
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('contract');
  const [loadingKey, setLoadingKey] = useState('');
  const [error, setError] = useState('');
  const scenarioTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusScenarioTab = useCallback((index: number) => {
    scenarioTabRefs.current[index]?.focus();
  }, []);

  const selectScenarioByIndex = useCallback(
    (index: number) => {
      const scenario = SCENARIOS[index];
      if (!scenario) {
        return;
      }
      setActiveScenario(scenario.id);
      setError('');
      focusScenarioTab(index);
    },
    [focusScenarioTab],
  );

  function handleScenarioKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const { key } = event;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
      return;
    }
    event.preventDefault();
    if (key === 'ArrowRight') {
      selectScenarioByIndex((index + 1) % SCENARIOS.length);
      return;
    }
    if (key === 'ArrowLeft') {
      selectScenarioByIndex((index - 1 + SCENARIOS.length) % SCENARIOS.length);
      return;
    }
    if (key === 'Home') {
      selectScenarioByIndex(0);
      return;
    }
    selectScenarioByIndex(SCENARIOS.length - 1);
  }

  const activeScenarioMeta = SCENARIOS.find((scenario) => scenario.id === activeScenario) ?? SCENARIOS[0];

  const showContractEmpty =
    activeScenario === 'contract' && !contractResult && loadingKey !== 'contract' && !error;
  const showCsEmpty = activeScenario === 'cs' && !csResult && loadingKey !== 'cs' && !error;
  const showPublishingEmpty =
    activeScenario === 'publishing' &&
    !pubStep1 &&
    !pubStep2 &&
    loadingKey !== 'pub1' &&
    loadingKey !== 'pub2' &&
    !error;

  async function run(key: string, fn: () => Promise<void>) {
    setLoadingKey(key);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(toHumanLoopErrorMessage(err, intl.formatMessage({ id: 'hil.error' })));
    } finally {
      setLoadingKey('');
    }
  }

  return (
    <div className={styles.panel}>
      <div
        className={styles.scenarioTabs}
        role="tablist"
        aria-label={intl.formatMessage({ id: 'hil.enterpriseScenarios' })}
      >
        {SCENARIOS.map((scenario, index) => {
          const tabId = `hil-enterprise-tab-${scenario.id}`;
          const isActive = activeScenario === scenario.id;
          return (
            <button
              key={scenario.id}
              ref={(node) => {
                scenarioTabRefs.current[index] = node;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={scenario.panelId}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
              onClick={() => selectScenarioByIndex(index)}
              onKeyDown={(event) => handleScenarioKeyDown(event, index)}
            >
              {intl.formatMessage({ id: scenario.labelId })}
            </button>
          );
        })}
      </div>

      {showContractEmpty || showCsEmpty || showPublishingEmpty ? (
        <HilEmptyHint>{intl.formatMessage({ id: 'hil.empty.enterprise' })}</HilEmptyHint>
      ) : null}

      {activeScenario === 'contract' ? (
      <section
        id={activeScenarioMeta.panelId}
        role="tabpanel"
        aria-labelledby={`hil-enterprise-tab-${activeScenarioMeta.id}`}
        className={styles.section}
      >
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>{intl.formatMessage({ id: 'hil.contractInput' })}</span>
          <textarea rows={3} value={contractText} onChange={(event) => setContractText(event.target.value)} />
        </label>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={loadingKey === 'contract'}
          onClick={() =>
            void run('contract', async () => {
              setContractResult(
                (await enterpriseContractReview(contractText)) as EnterpriseContractResponse,
              );
            })
          }
        >
          {loadingKey === 'contract'
            ? intl.formatMessage({ id: 'hil.running' })
            : intl.formatMessage({ id: 'hil.run' })}
        </button>
        {contractResult ? (
          <HilResultFacts
            title={intl.formatMessage({ id: 'hil.resultContract' })}
            items={[
              {
                label: intl.formatMessage({ id: 'hil.factStatus' }),
                value: String(contractResult.status ?? ''),
                variant: publishVariant(String(contractResult.status ?? '')),
              },
              {
                label: intl.formatMessage({ id: 'hil.factRiskLevel' }),
                value: String(contractResult.riskLevel ?? ''),
                variant: riskVariant(String(contractResult.riskLevel ?? '')),
              },
              { label: intl.formatMessage({ id: 'hil.factRiskDetails' }), value: String(contractResult.riskDetails ?? '') },
              { label: intl.formatMessage({ id: 'hil.factAuditReport' }), value: String(contractResult.auditReport ?? '') },
              { label: intl.formatMessage({ id: 'hil.factStructuredText' }), value: String(contractResult.structuredText ?? '') },
              {
                label: intl.formatMessage({ id: 'hil.factElapsed' }),
                value: formatMillis(Number(contractResult.elapsedMillis), elapsedUnit),
              },
            ]}
          />
        ) : null}
      </section>
      ) : null}

      {activeScenario === 'cs' ? (
      <section
        id={activeScenarioMeta.panelId}
        role="tabpanel"
        aria-labelledby={`hil-enterprise-tab-${activeScenarioMeta.id}`}
        className={styles.section}
      >
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>{intl.formatMessage({ id: 'hil.csInput' })}</span>
          <textarea rows={2} value={userMessage} onChange={(event) => setUserMessage(event.target.value)} />
        </label>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={loadingKey === 'cs'}
          onClick={() =>
            void run('cs', async () => {
              setCsResult((await enterpriseEcommerceCs(userMessage)) as EnterpriseCsResponse);
            })
          }
        >
          {loadingKey === 'cs'
            ? intl.formatMessage({ id: 'hil.running' })
            : intl.formatMessage({ id: 'hil.run' })}
        </button>
        {csResult ? (
          <HilResultFacts
            title={intl.formatMessage({ id: 'hil.resultCs' })}
            items={[
              { label: intl.formatMessage({ id: 'hil.factIntent' }), value: String(csResult.intent ?? '') },
              { label: intl.formatMessage({ id: 'hil.factProductHit' }), value: String(csResult.productKbHit ?? '') },
              { label: intl.formatMessage({ id: 'hil.factPolicyHit' }), value: String(csResult.policyKbHit ?? '') },
              { label: intl.formatMessage({ id: 'hil.factFinalReply' }), value: String(csResult.finalReply ?? '') },
              {
                label: intl.formatMessage({ id: 'hil.factElapsed' }),
                value: formatMillis(Number(csResult.elapsedMillis), elapsedUnit),
              },
            ]}
          />
        ) : null}
      </section>
      ) : null}

      {activeScenario === 'publishing' ? (
      <section
        id={activeScenarioMeta.panelId}
        role="tabpanel"
        aria-labelledby={`hil-enterprise-tab-${activeScenarioMeta.id}`}
        className={styles.section}
      >
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>{intl.formatMessage({ id: 'hil.threadId' })}</span>
            <input value={pubThreadId} onChange={(event) => setPubThreadId(event.target.value)} />
          </label>
          <label className={styles.field}>
            <span>{intl.formatMessage({ id: 'hil.hotKeywords' })}</span>
            <input value={hotKeywords} onChange={(event) => setHotKeywords(event.target.value)} />
          </label>
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={loadingKey === 'pub1'}
          onClick={() =>
            void run('pub1', async () => {
              setPubStep2(null);
              setPubStep1(
                (await enterprisePublishingStep1(pubThreadId.trim(), hotKeywords)) as EnterprisePublishingStep1Response,
              );
            })
          }
        >
          {loadingKey === 'pub1'
            ? intl.formatMessage({ id: 'hil.running' })
            : intl.formatMessage({ id: 'hil.publishingStep1' })}
        </button>
        {pubStep1 ? (
          <HilResultFacts
            title={intl.formatMessage({ id: 'hil.resultPublishingStep1' })}
            items={[
              {
                label: intl.formatMessage({ id: 'hil.factStatus' }),
                value: String(pubStep1.status ?? ''),
                variant: publishVariant(String(pubStep1.status ?? '')),
              },
              { label: intl.formatMessage({ id: 'hil.factSelectedTitle' }), value: String(pubStep1.selectedTitle ?? '') },
              { label: intl.formatMessage({ id: 'hil.factArticleDraft' }), value: String(pubStep1.articleDraft ?? '') },
              {
                label: intl.formatMessage({ id: 'hil.factSuspectedWords' }),
                value: String(pubStep1.suspectedWords ?? ''),
                variant: pubStep1.suspectedWords ? 'warning' : undefined,
              },
              { label: intl.formatMessage({ id: 'hil.factPublishLog' }), value: String(pubStep1.publishLog ?? '') },
              { label: intl.formatMessage({ id: 'hil.factNextStep' }), value: String(pubStep1.nextStepHint ?? '') },
            ]}
          />
        ) : null}
        {pubStep1?.status?.includes('INTERRUPTED') ? (
          <>
            <label className={styles.field}>
              <span>{intl.formatMessage({ id: 'hil.humanApproved' })}</span>
              <select
                value={humanApproved ? 'true' : 'false'}
                onChange={(event) => setHumanApproved(event.target.value === 'true')}
              >
                <option value="true">{intl.formatMessage({ id: 'hil.yes' })}</option>
                <option value="false">{intl.formatMessage({ id: 'hil.no' })}</option>
              </select>
            </label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>{intl.formatMessage({ id: 'hil.humanComment' })}</span>
              <input value={humanComment} onChange={(event) => setHumanComment(event.target.value)} />
            </label>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={loadingKey === 'pub2'}
              onClick={() =>
                void run('pub2', async () => {
                  setPubStep2(
                    (await enterprisePublishingStep2({
                      threadId: pubThreadId.trim(),
                      checkpointId: String(pubStep1.checkpointId ?? ''),
                      humanApproved,
                      humanComment,
                    })) as EnterprisePublishingStep2Response,
                  );
                })
              }
            >
              {loadingKey === 'pub2'
                ? intl.formatMessage({ id: 'hil.running' })
                : intl.formatMessage({ id: 'hil.publishingStep2' })}
            </button>
          </>
        ) : null}
        {pubStep2 ? (
          <HilResultFacts
            title={intl.formatMessage({ id: 'hil.resultPublishingStep2' })}
            items={[
              {
                label: intl.formatMessage({ id: 'hil.factPublishStatus' }),
                value: String(pubStep2.publishStatus ?? ''),
                variant: publishVariant(String(pubStep2.publishStatus ?? '')),
              },
              { label: intl.formatMessage({ id: 'hil.factPublishLog' }), value: String(pubStep2.publishLog ?? '') },
            ]}
          />
        ) : null}
      </section>
      ) : null}
      <HilErrorAlert message={error} />
    </div>
  );
}
