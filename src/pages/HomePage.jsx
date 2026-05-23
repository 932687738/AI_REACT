import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchAgentHubStatus } from '@/api/agentHub'
import { sendChatMessage } from '@/api/chat'
import { CHAT_MODE, AGENT_HUB_VIEWS, DEFAULT_CHAT_MODE, SIDEBAR_CHAT_VIEW } from '@/constants/chatMode'
import { messages } from '@/i18n/messages'
import SettingsPage from '@/pages/SettingsPage'
import brandYxy from '@/assets/brand-yxy.png'
import {
  deriveConversationTitle,
  deleteConversationHistory,
  deleteConversationMessages,
  loadConversationHistory,
  loadConversationMessages,
  saveConversationHistory,
  saveConversationMessages,
  truncateTitle,
  updateConversationHistory,
  upsertConversationHistory,
} from '@/services/conversationHistory'

function createConversationId() {
  const now = Date.now()

  if (createConversationId.lastNow === now) {
    createConversationId.sequence += 1
  } else {
    createConversationId.lastNow = now
    createConversationId.sequence = 0
  }

  return createConversationId.sequence === 0 ? String(now) : `${now}-${createConversationId.sequence}`
}

createConversationId.lastNow = 0
createConversationId.sequence = 0

function resolveChatMode(sidebarView) {
  if (sidebarView === SIDEBAR_CHAT_VIEW.KNOWLEDGE) {
    return CHAT_MODE.KNOWLEDGE
  }

  if (sidebarView === SIDEBAR_CHAT_VIEW.AGENT || AGENT_HUB_VIEWS.includes(sidebarView)) {
    return CHAT_MODE.AGENT
  }

  return DEFAULT_CHAT_MODE
}

function isChatView(sidebarView) {
  return sidebarView === SIDEBAR_CHAT_VIEW.KNOWLEDGE || sidebarView === SIDEBAR_CHAT_VIEW.AGENT
}

function resolveHistoryMode(item) {
  return item?.mode === CHAT_MODE.AGENT ? CHAT_MODE.AGENT : CHAT_MODE.KNOWLEDGE
}

function normalizeHistoryItems(items) {
  return items
    .map((item) => ({
      ...item,
      id: String(item.id || '').trim(),
      title: String(item.title || item.preview || '暂无聊天内容').trim(),
      preview: String(item.preview || '').trim(),
      updatedAt: Number(item.updatedAt) || Date.now(),
    }))
    .filter((item) => item.id)
}

function HomePage({ language, onLanguageChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentView, setCurrentView] = useState('chat')
  const [sidebarView, setSidebarView] = useState(SIDEBAR_CHAT_VIEW.KNOWLEDGE)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [conversationId, setConversationId] = useState(() => createConversationId())
  const [historyItems, setHistoryItems] = useState(() => normalizeHistoryItems(loadConversationHistory()))
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [historyMenuId, setHistoryMenuId] = useState(null)
  const [historyMenuPosition, setHistoryMenuPosition] = useState(null)
  const [skillStatus, setSkillStatus] = useState(null)
  const [skillLoading, setSkillLoading] = useState(false)
  const t = messages[language]
  const chatMode = useMemo(() => resolveChatMode(sidebarView), [sidebarView])
  const visibleHistoryItems = useMemo(
    () =>
      historyItems.filter((item) => {
        const itemMode = item.mode || CHAT_MODE.KNOWLEDGE
        return itemMode === chatMode
      }),
    [historyItems, chatMode],
  )
  const sidebarRef = useRef(null)
  const listRef = useRef(null)
  const endRef = useRef(null)
  const renameInputRef = useRef(null)

  useEffect(() => {
    setChatMessages([])
    setInputValue('')
    setConversationId(createConversationId())
    setSidebarView(SIDEBAR_CHAT_VIEW.KNOWLEDGE)
    setHistoryMenuId(null)
    setHistoryMenuPosition(null)
  }, [language])

  useEffect(() => {
    if (!listRef.current || !endRef.current || chatMessages.length === 0) {
      return
    }

    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ block: 'end' })
    })
  }, [chatMessages])

  useEffect(() => {
    saveConversationHistory(historyItems)
  }, [historyItems])

  useEffect(() => {
    if (!AGENT_HUB_VIEWS.includes(sidebarView)) {
      return
    }

    let alive = true

    async function loadStatus() {
      setSkillLoading(true)

      try {
        const data = await fetchAgentHubStatus(language, CHAT_MODE.AGENT)
        if (alive) {
          setSkillStatus(data)
        }
      } catch {
        if (alive) {
          setSkillStatus({ modules: [], skills: [], subAgents: [], tools: [], mcpCallbacks: [] })
        }
      } finally {
        if (alive) {
          setSkillLoading(false)
        }
      }
    }

    loadStatus()

    return () => {
      alive = false
    }
  }, [language, sidebarView])

  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [renamingId])

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!event.target.closest('.sidebar__history-menu') && !event.target.closest('.sidebar__history-more')) {
        setHistoryMenuId(null)
        setHistoryMenuPosition(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const composerPlaceholder = useMemo(
    () => (chatMode === CHAT_MODE.KNOWLEDGE ? t.placeholderKnowledge : t.placeholderAgent),
    [chatMode, t],
  )

  const chatHeader = useMemo(
    () =>
      chatMode === CHAT_MODE.KNOWLEDGE
        ? { title: t.chatTitleKnowledge, subtitle: t.chatSubtitleKnowledge }
        : { title: t.chatTitleAgent, subtitle: t.chatSubtitleAgent },
    [chatMode, t],
  )

  const welcomeContent = useMemo(
    () =>
      chatMode === CHAT_MODE.KNOWLEDGE
        ? { title: t.welcomeTitleKnowledge, body: t.welcomeBodyKnowledge }
        : { title: t.welcomeTitleAgent, body: t.welcomeBodyAgent },
    [chatMode, t],
  )

  const quickActions = useMemo(
    () => [
      { id: 'fast', label: t.quickFast },
      { id: 'code', label: t.quickCode },
      { id: 'write', label: t.quickWrite },
      { id: 'music', label: t.quickMusic },
      { id: 'more', label: t.quickMore },
    ],
    [t],
  )

  function openHistoryMenu(event, id) {
    const buttonRect = event.currentTarget.getBoundingClientRect()
    const menuWidth = 132
    const menuHeight = 96
    const showAbove = window.innerHeight - buttonRect.bottom < menuHeight + 16
    const preferredLeft = buttonRect.left
    const left = Math.max(12, Math.min(preferredLeft, window.innerWidth - menuWidth - 12))
    const top = showAbove ? buttonRect.top - menuHeight - 6 : buttonRect.bottom + 6

    setHistoryMenuId((current) => (current === id ? null : id))
    setHistoryMenuPosition(
      historyMenuId === id
        ? null
        : {
            left,
            top: Math.max(12, top),
          },
    )
  }

  function handleStartKnowledgeChat() {
    setSidebarView(SIDEBAR_CHAT_VIEW.KNOWLEDGE)
    setChatMessages([])
    setInputValue('')
    setConversationId(createConversationId())
    setMenuOpen(false)
    setRenamingId(null)
    setRenameValue('')
    setHistoryMenuId(null)
    setHistoryMenuPosition(null)
  }

  function handleStartAgentChat() {
    setSidebarView(SIDEBAR_CHAT_VIEW.AGENT)
    setChatMessages([])
    setInputValue('')
    setConversationId(createConversationId())
    setMenuOpen(false)
    setRenamingId(null)
    setRenameValue('')
    setHistoryMenuId(null)
    setHistoryMenuPosition(null)
  }

  function handleStartNewChat() {
    if (chatMode === CHAT_MODE.AGENT) {
      handleStartAgentChat()
      return
    }

    handleStartKnowledgeChat()
  }

  function handleHistoryChat(item) {
    const itemMode = item.mode || CHAT_MODE.KNOWLEDGE
    setSidebarView(itemMode === CHAT_MODE.AGENT ? SIDEBAR_CHAT_VIEW.AGENT : SIDEBAR_CHAT_VIEW.KNOWLEDGE)
    setInputValue('')
    setConversationId(item.id)
    setChatMessages(loadConversationMessages(item.id))
    setRenamingId(null)
    setRenameValue('')
    setHistoryMenuId(null)
    setHistoryMenuPosition(null)
  }

  function handleRenameStart(item) {
    setRenamingId(item.id)
    setRenameValue(item.title)
    setHistoryMenuId(null)
    setHistoryMenuPosition(null)
  }

  function handleRenameCommit(id) {
    const nextTitle = truncateTitle(renameValue, 24) || (chatMode === CHAT_MODE.AGENT ? t.agentChat : t.knowledgeChat)
    setHistoryItems((current) => updateConversationHistory(current, id, { title: nextTitle }))
    setRenamingId(null)
    setRenameValue('')
  }

  function handleDeleteHistory(id) {
    setHistoryItems((current) => deleteConversationHistory(current, id))
    deleteConversationMessages(id)
    setHistoryMenuId(null)
    setHistoryMenuPosition(null)
    setRenamingId(null)
    setRenameValue('')

    if (conversationId === id) {
      handleStartNewChat()
    }
  }

  async function submitMessage(rawMessage) {
    const message = rawMessage.trim()

    if (!message || isSending) {
      return
    }

    const userMessageId = `user-${Date.now()}`
    const assistantMessageId = `assistant-${Date.now()}`
    const nextMessages = [
      ...chatMessages,
      { id: userMessageId, role: 'user', kind: 'text', text: message },
      { id: assistantMessageId, role: 'assistant', kind: 'text', text: '', pending: true },
    ]

    setInputValue('')
    setIsSending(true)
    setChatMessages(nextMessages)
    saveConversationMessages(conversationId, nextMessages)

    setHistoryItems((current) => {
      const existing = current.find((item) => item.id === conversationId)
      const nextItem = existing
        ? { ...existing, preview: message, updatedAt: Date.now() }
        : {
            id: conversationId,
            title: deriveConversationTitle(
              message,
              chatMode === CHAT_MODE.AGENT ? t.agentChat : t.knowledgeChat,
            ),
            preview: message,
            updatedAt: Date.now(),
            mode: chatMode,
          }

      return upsertConversationHistory(current.slice(0, 10), nextItem)
    })

    try {
      await sendChatMessage(
        { conversationId, message, language, mode: chatMode },
        {
          onChunk: (chunk) => {
            setChatMessages((current) => {
              const updated = current.map((item) =>
                item.id === assistantMessageId
                  ? { ...item, text: `${item.text}${chunk}`, pending: false }
                  : item,
              )
              saveConversationMessages(conversationId, updated)
              return updated
            })
          },
          onComplete: () => {
            setChatMessages((current) => {
              const updated = current.map((item) =>
                item.id === assistantMessageId ? { ...item, pending: false } : item,
              )
              saveConversationMessages(conversationId, updated)
              return updated
            })
          },
        },
      )
    } catch {
      setChatMessages((current) => {
        const updated = current.map((item) =>
          item.id === assistantMessageId
            ? { ...item, text: t.errorMessage, pending: false, error: true }
            : item,
        )
        saveConversationMessages(conversationId, updated)
        return updated
      })
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitMessage(inputValue)
  }

  function handleComposerKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitMessage(inputValue)
    }
  }

  function formatExampleMeta(examples = []) {
    if (examples.length === 0) {
      return ''
    }

    const [firstExample] = examples
    const firstLabel = firstExample?.title || firstExample?.description

    if (firstLabel) {
      return `${t.skillExamples}: ${firstLabel}`
    }

    return `${t.skillExamples}: ${examples.length}`
  }

  function renderHistoryModeBadge(item) {
    const itemMode = resolveHistoryMode(item)
    const label = itemMode === CHAT_MODE.AGENT ? t.historyModeAgent : t.historyModeKnowledge

    return (
      <span
        className={`sidebar__history-mode sidebar__history-mode--${itemMode}`}
        aria-label={itemMode === CHAT_MODE.AGENT ? t.agentChat : t.knowledgeChat}
        title={itemMode === CHAT_MODE.AGENT ? t.agentChat : t.knowledgeChat}
      >
        {label}
      </span>
    )
  }

  function renderInstalledCard(item, typeLabel, extraLabel) {
    return (
      <article key={`${typeLabel}-${item.name}`} className="skill-card skill-card--installed">
        <div className="skill-card__icon">*</div>
        <div className="skill-card__body">
          <strong>{item.name}</strong>
          <p>{item.description || t.skillEmpty}</p>
          {extraLabel ? <small>{extraLabel}</small> : null}
        </div>
        <span className="skill-card__status">+</span>
      </article>
    )
  }

  function renderSkillsPage() {
    const skillList = skillStatus?.skills ?? []

    return (
      <section className="skills-screen">
        <header className="skills-screen__topbar">
          <button type="button" className="skills-refresh">
            {t.skillRefresh}
          </button>
          <label className="skills-search">
            <span>*</span>
            <input type="text" placeholder={t.skillSearchPlaceholder} />
          </label>
        </header>

        <div className="skills-screen__header">
          <h1>{t.skillsPageTitle}</h1>
          <p>{t.skillsPageSubtitle}</p>
        </div>

        <section className="skills-section">
          <h2>{t.skillTitle}</h2>
          <div className="skills-grid">
            {skillLoading ? (
              <div className="skills-empty">{t.streamingLabel}</div>
            ) : skillList.length > 0 ? (
              skillList.map((item) =>
                renderInstalledCard(
                  item,
                  'skill',
                  [`${t.skillTools}: ${item.toolCount}`, formatExampleMeta(item.examples)]
                    .filter(Boolean)
                    .join(' · '),
                ),
              )
            ) : (
              <div className="skills-empty">{t.skillsPageEmpty}</div>
            )}
          </div>
        </section>
      </section>
    )
  }

  function renderNodeList(title, subtitle, emptyText, items, typeLabel) {
    return (
      <section className="skills-screen">
        <div className="skills-screen__header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <section className="skills-section">
          <div className="skills-grid">
            {skillLoading ? (
              <div className="skills-empty">{t.streamingLabel}</div>
            ) : items.length > 0 ? (
              items.map((item) =>
                renderInstalledCard(
                  item,
                  typeLabel,
                  formatExampleMeta(item.examples),
                ),
              )
            ) : (
              <div className="skills-empty">{emptyText}</div>
            )}
          </div>
        </section>
      </section>
    )
  }

  if (currentView === 'settings') {
    return (
      <SettingsPage
        language={language}
        onLanguageChange={onLanguageChange}
        onBack={() => setCurrentView('chat')}
      />
    )
  }

  return (
    <main className="chat-shell">
      <aside className="sidebar" ref={sidebarRef}>
        <div className="sidebar__brand">
          <img className="brand-mark" src={brandYxy} alt="Nebula Desk" />
          <div>
            <strong>{t.appName}</strong>
            <p>{t.brand}</p>
          </div>
        </div>

        <div className="sidebar__menu">
          <button
            className={`sidebar__menu-button ${sidebarView === SIDEBAR_CHAT_VIEW.KNOWLEDGE ? 'is-active' : ''}`}
            type="button"
            onClick={handleStartKnowledgeChat}
          >
            <span className="sidebar__item-icon">*</span>
            <span className="sidebar__item-label">{t.knowledgeChat}</span>
          </button>

          <button
            className={`sidebar__menu-button ${sidebarView === SIDEBAR_CHAT_VIEW.AGENT ? 'is-active' : ''}`}
            type="button"
            onClick={handleStartAgentChat}
          >
            <span className="sidebar__item-icon">*</span>
            <span className="sidebar__item-label">{t.agentChat}</span>
          </button>

          <button
            type="button"
            className={`sidebar__menu-button sidebar__menu-button--nested ${
              sidebarView === 'skills' ? 'is-active' : ''
            }`}
            onClick={() => setSidebarView('skills')}
          >
            <span className="sidebar__item-icon">*</span>
            <span className="sidebar__item-label">{t.sidebarSkills}</span>
          </button>

          <button
            type="button"
            className={`sidebar__menu-button sidebar__menu-button--nested ${
              sidebarView === 'agents' ? 'is-active' : ''
            }`}
            onClick={() => setSidebarView('agents')}
          >
            <span className="sidebar__item-icon">*</span>
            <span className="sidebar__item-label">{t.sidebarAgents}</span>
          </button>

          <button
            type="button"
            className={`sidebar__menu-button sidebar__menu-button--nested ${
              sidebarView === 'tools' ? 'is-active' : ''
            }`}
            onClick={() => setSidebarView('tools')}
          >
            <span className="sidebar__item-icon">*</span>
            <span className="sidebar__item-label">{t.sidebarTools}</span>
          </button>

          <button
            type="button"
            className={`sidebar__menu-button sidebar__menu-button--nested ${
              sidebarView === 'mcpCallbacks' ? 'is-active' : ''
            }`}
            onClick={() => setSidebarView('mcpCallbacks')}
          >
            <span className="sidebar__item-icon">*</span>
            <span className="sidebar__item-label">{t.sidebarMcp}</span>
          </button>
        </div>

        <div className="sidebar__module sidebar__module--history">
          <div className="sidebar__module-title">{t.recentChats}</div>
          <div className="sidebar__history">
            {visibleHistoryItems.length > 0 ? (
              visibleHistoryItems.map((item) => (
                <div key={item.id} className="sidebar__history-row">
                  {renamingId === item.id ? (
                    <input
                      ref={renameInputRef}
                      className="sidebar__history-input"
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      onBlur={() => handleRenameCommit(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleRenameCommit(item.id)
                        }
                        if (event.key === 'Escape') {
                          setRenamingId(null)
                          setRenameValue('')
                        }
                      }}
                    />
                  ) : (
                    <div className="sidebar__history-item-wrap">
                      <button
                        type="button"
                        className={`sidebar__history-item ${
                          isChatView(sidebarView) && conversationId === item.id ? 'is-active' : ''
                        }`}
                        onClick={() => handleHistoryChat(item)}
                      >
                        {renderHistoryModeBadge(item)}
                        <span className="sidebar__item-label sidebar__history-title">
                          {item.title || t.noChatContent}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="sidebar__history-more"
                        aria-label="更多"
                        onClick={(event) => openHistoryMenu(event, item.id)}
                      >
                        ⋯
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="sidebar__history-empty">{t.noChatContent}</div>
            )}
          </div>
        </div>

        <div className="sidebar__account">
          {menuOpen ? (
            <div className="account-menu">
              <button
                type="button"
                className="is-highlighted"
                onClick={() => {
                  setCurrentView('settings')
                  setMenuOpen(false)
                }}
              >
                <span className="account-menu__icon">S</span>
                <span>{t.settings}</span>
              </button>
              <button type="button" onClick={() => setMenuOpen(false)}>
                <span className="account-menu__icon">L</span>
                <span>{t.logout}</span>
              </button>
            </div>
          ) : null}

          <button
            type="button"
            className="account-trigger"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="account-trigger__avatar">N</span>
            <span className="account-trigger__name">{t.profileName}</span>
            <span className="account-trigger__arrow">{'>'}</span>
          </button>
        </div>
      </aside>

      {historyMenuId && historyMenuPosition ? (
        <div
          className="sidebar__history-menu sidebar__history-menu--floating"
          style={{
            left: `${historyMenuPosition.left}px`,
            top: `${historyMenuPosition.top}px`,
          }}
        >
          <button
            type="button"
            onClick={() => {
              const item = historyItems.find((entry) => entry.id === historyMenuId)
              if (item) {
                handleRenameStart(item)
              }
            }}
          >
            {language === 'zh' ? '修改' : 'Rename'}
          </button>
          <button
            type="button"
            onClick={() => {
              handleDeleteHistory(historyMenuId)
            }}
          >
            {language === 'zh' ? '删除' : 'Delete'}
          </button>
        </div>
      ) : null}

      <section className="chat-main">
        {sidebarView === 'skills' ? (
          renderSkillsPage()
        ) : sidebarView === 'agents' ? (
          renderNodeList(
            t.agentsPageTitle,
            t.agentsPageSubtitle,
            t.agentsPageEmpty,
            skillStatus?.subAgents ?? [],
            'agent',
          )
        ) : sidebarView === 'tools' ? (
          renderNodeList(
            t.toolsPageTitle,
            t.toolsPageSubtitle,
            t.toolsPageEmpty,
            skillStatus?.tools ?? [],
            'tool',
          )
        ) : sidebarView === 'mcpCallbacks' ? (
          renderNodeList(
            t.mcpPageTitle,
            t.mcpPageSubtitle,
            t.mcpPageEmpty,
            skillStatus?.mcpCallbacks ?? [],
            'mcp',
          )
        ) : isChatView(sidebarView) ? (
          <>
            <header className="chat-topbar chat-topbar--center">
              <div>
                <h1>{chatHeader.title}</h1>
                <p>{chatHeader.subtitle}</p>
              </div>
            </header>

            {chatMessages.length === 0 ? (
              <section className="welcome-panel">
                <img className="welcome-panel__image" src={brandYxy} alt="Nebula preview" />
                <h2>{welcomeContent.title}</h2>
                <p>{welcomeContent.body}</p>
              </section>
            ) : (
              <div className="chat-area chat-area--thread" ref={listRef}>
                {chatMessages.map((item) => (
                  <article
                    key={item.id}
                    className={`message-row ${item.role === 'user' ? 'message-row--user' : ''}`}
                  >
                    <div
                      className={`bubble ${
                        item.role === 'user' ? 'bubble--user' : 'bubble--assistant'
                      } ${item.error ? 'bubble--error' : ''}`}
                    >
                      {item.text ? <div className="bubble__text">{item.text}</div> : null}
                      {item.pending ? <span className="stream-cursor" /> : null}
                    </div>
                  </article>
                ))}
                <div ref={endRef} />
              </div>
            )}

            <form className="composer composer--rich" onSubmit={handleSubmit}>
              <textarea
                className="composer__input"
                rows="3"
                placeholder={composerPlaceholder}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleComposerKeyDown}
              />

              <div className="composer__toolbar">
                <div className="composer__shortcuts">
                  {quickActions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="composer-shortcut"
                      onClick={() => submitMessage(item.label)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button type="submit" className="composer__send" disabled={isSending}>
                  {isSending ? t.sending : t.send}
                </button>
              </div>
            </form>
          </>
        ) : null}
      </section>
    </main>
  )
}

export default HomePage
