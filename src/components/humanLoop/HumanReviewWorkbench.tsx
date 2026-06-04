import { useCallback, useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import DraftHilPanel from './DraftHilPanel';
import EnterpriseWorkflowPanel from './EnterpriseWorkflowPanel';
import ToolFeedbackPanel from './ToolFeedbackPanel';
import styles from './humanLoop.less';

const TABS = [
  { id: 'draft', labelId: 'hil.tab.draft', panelId: 'hil-panel-draft' },
  { id: 'tool', labelId: 'hil.tab.tool', panelId: 'hil-panel-tool' },
  { id: 'enterprise', labelId: 'hil.tab.enterprise', panelId: 'hil-panel-enterprise' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function HumanReviewWorkbench() {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<TabId>('draft');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus();
  }, []);

  const selectTabByIndex = useCallback(
    (index: number) => {
      const tab = TABS[index];
      if (!tab) {
        return;
      }
      setActiveTab(tab.id);
      focusTab(index);
    },
    [focusTab],
  );

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const { key } = event;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
      return;
    }
    event.preventDefault();
    if (key === 'ArrowRight') {
      selectTabByIndex((index + 1) % TABS.length);
      return;
    }
    if (key === 'ArrowLeft') {
      selectTabByIndex((index - 1 + TABS.length) % TABS.length);
      return;
    }
    if (key === 'Home') {
      selectTabByIndex(0);
      return;
    }
    selectTabByIndex(TABS.length - 1);
  }

  const activeTabMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  return (
    <section className={styles.workbench} aria-labelledby="hil-workbench-title">
      <header className={styles.header}>
        <div>
          <h1 id="hil-workbench-title">{intl.formatMessage({ id: 'hil.title' })}</h1>
          <p>{intl.formatMessage({ id: 'hil.subtitle' })}</p>
        </div>
        <p className={styles.notice}>{intl.formatMessage({ id: 'hil.scopeNotice' })}</p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label={intl.formatMessage({ id: 'hil.title' })}>
        {TABS.map((tab, index) => {
          const tabId = `hil-tab-${tab.id}`;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={tab.panelId}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {intl.formatMessage({ id: tab.labelId })}
            </button>
          );
        })}
      </div>

      <div
        id={activeTabMeta.panelId}
        className={styles.body}
        role="tabpanel"
        aria-labelledby={`hil-tab-${activeTabMeta.id}`}
      >
        {activeTab === 'draft' ? <DraftHilPanel /> : null}
        {activeTab === 'tool' ? <ToolFeedbackPanel /> : null}
        {activeTab === 'enterprise' ? <EnterpriseWorkflowPanel /> : null}
      </div>
    </section>
  );
}
