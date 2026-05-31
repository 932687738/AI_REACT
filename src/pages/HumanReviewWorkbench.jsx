import { useCallback, useRef, useState } from 'react'
import DraftHilPanel from '@/components/humanLoop/DraftHilPanel'
import EnterpriseWorkflowPanel from '@/components/humanLoop/EnterpriseWorkflowPanel'
import ToolFeedbackPanel from '@/components/humanLoop/ToolFeedbackPanel'
import { messages } from '@/i18n/messages'

const TABS = [
  { id: 'draft', labelKey: 'humanReviewTabDraft', panelId: 'hil-panel-draft' },
  { id: 'tool', labelKey: 'humanReviewTabTool', panelId: 'hil-panel-tool' },
  { id: 'enterprise', labelKey: 'humanReviewTabEnterprise', panelId: 'hil-panel-enterprise' },
]

export default function HumanReviewWorkbench({ language }) {
  const t = messages[language] ?? messages.zh
  const [activeTab, setActiveTab] = useState('draft')
  const tabRefs = useRef([])

  const focusTab = useCallback((index) => {
    tabRefs.current[index]?.focus()
  }, [])

  const selectTabByIndex = useCallback(
    (index) => {
      const tab = TABS[index]
      if (!tab) {
        return
      }
      setActiveTab(tab.id)
      focusTab(index)
    },
    [focusTab],
  )

  function handleTabKeyDown(event, index) {
    const { key } = event
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
      return
    }
    event.preventDefault()
    if (key === 'ArrowRight') {
      selectTabByIndex((index + 1) % TABS.length)
      return
    }
    if (key === 'ArrowLeft') {
      selectTabByIndex((index - 1 + TABS.length) % TABS.length)
      return
    }
    if (key === 'Home') {
      selectTabByIndex(0)
      return
    }
    selectTabByIndex(TABS.length - 1)
  }

  const activeTabMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0]

  return (
    <section className="hil-workbench skills-screen" aria-labelledby="hil-workbench-title">
      <header className="skills-screen__header hil-workbench__header">
        <div>
          <h1 id="hil-workbench-title">{t.humanReviewTitle}</h1>
          <p>{t.humanReviewSubtitle}</p>
        </div>
        <p className="hil-workbench__notice">{t.humanReviewScopeNotice}</p>
      </header>

      <div className="hil-tabs" role="tablist" aria-label={t.humanReviewTitle}>
        {TABS.map((tab, index) => {
          const tabId = `hil-tab-${tab.id}`
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={tab.panelId}
              tabIndex={isActive ? 0 : -1}
              className={`hil-tabs__button ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {t[tab.labelKey]}
            </button>
          )
        })}
      </div>

      <div
        id={activeTabMeta.panelId}
        className="hil-workbench__body"
        role="tabpanel"
        aria-labelledby={`hil-tab-${activeTabMeta.id}`}
      >
        {activeTab === 'draft' ? <DraftHilPanel language={language} /> : null}
        {activeTab === 'tool' ? <ToolFeedbackPanel language={language} /> : null}
        {activeTab === 'enterprise' ? <EnterpriseWorkflowPanel language={language} /> : null}
      </div>
    </section>
  )
}
