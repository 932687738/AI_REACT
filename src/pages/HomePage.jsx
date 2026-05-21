import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchAgentHubStatus } from '@/api/agentHub'
import { sendChatMessage } from '@/api/chat'
import { messages } from '@/i18n/messages'
import SettingsPage from '@/pages/SettingsPage'
import brandYxy from '@/assets/brand-yxy.png'

function createConversationId() {
  return String(Date.now())
}

function HomePage({ language, onLanguageChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentView, setCurrentView] = useState('chat')
  const [sidebarView, setSidebarView] = useState('skills')
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [conversationId, setConversationId] = useState(() => createConversationId())
  const [skillStatus, setSkillStatus] = useState(null)
  const [skillLoading, setSkillLoading] = useState(false)
  const t = messages[language]
  const listRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    setChatMessages([])
    setInputValue('')
    setConversationId(createConversationId())
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
    if (!['skills', 'agents', 'tools', 'mcpCallbacks'].includes(sidebarView)) {
      return
    }

    let alive = true

    async function loadStatus() {
      setSkillLoading(true)

      try {
        const data = await fetchAgentHubStatus()
        if (alive) {
          setSkillStatus(data)
        }
      } catch {
        if (alive) {
          setSkillStatus({ skills: [], subAgents: [], tools: [], mcpCallbacks: [] })
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
  }, [sidebarView])

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

  async function submitMessage(rawMessage) {
    const message = rawMessage.trim()

    if (!message || isSending) {
      return
    }

    const userMessageId = `user-${Date.now()}`
    const assistantMessageId = `assistant-${Date.now()}`

    setInputValue('')
    setIsSending(true)
    setChatMessages((current) => [
      ...current,
      { id: userMessageId, role: 'user', kind: 'text', text: message },
      { id: assistantMessageId, role: 'assistant', kind: 'text', text: '', pending: true },
    ])

    try {
      await sendChatMessage(
        { conversationId, message, language },
        {
          onChunk: (chunk) => {
            setChatMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? { ...item, text: `${item.text}${chunk}`, pending: false }
                  : item,
              ),
            )
          },
          onComplete: () => {
            setChatMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId ? { ...item, pending: false } : item,
              ),
            )
          },
        },
      )
    } catch {
      setChatMessages((current) =>
        current.map((item) =>
          item.id === assistantMessageId
            ? { ...item, text: t.errorMessage, pending: false, error: true }
            : item,
        ),
      )
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

  function handleNewChat() {
    setSidebarView('chat')
    setChatMessages([])
    setInputValue('')
    setConversationId(createConversationId())
    setMenuOpen(false)
  }

  function renderInstalledCard(item, typeLabel, extraLabel) {
    return (
      <article key={`${typeLabel}-${item.name}`} className="skill-card skill-card--installed">
        <div className="skill-card__icon">◎</div>
        <div className="skill-card__body">
          <strong>{item.name}</strong>
          <p>{item.description || item.promptAugmentation || t.skillEmpty}</p>
          <small>{extraLabel}</small>
        </div>
        <span className="skill-card__status">✓</span>
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
            <span>⌕</span>
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
                renderInstalledCard(item, 'skill', `${t.skillTools}: ${item.toolCount}`),
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
                  item.description || item.promptAugmentation || emptyText,
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
      <aside className="sidebar">
        <div className="sidebar__brand">
          <img className="brand-mark" src={brandYxy} alt="Nebula Desk" />
          <div>
            <strong>{t.appName}</strong>
            <p>{t.brand}</p>
          </div>
        </div>

        <div className="sidebar__menu">
          <button
            className={`sidebar__menu-button ${sidebarView === 'chat' ? 'is-active' : ''}`}
            type="button"
            onClick={handleNewChat}
          >
            <span className="sidebar__item-icon">◎</span>
            <span className="sidebar__item-label">{t.newChat}</span>
          </button>

          <button
            type="button"
            className={`sidebar__menu-button ${sidebarView === 'skills' ? 'is-active' : ''}`}
            onClick={() => setSidebarView('skills')}
          >
            <span className="sidebar__item-icon">◌</span>
            <span className="sidebar__item-label">{t.sidebarSkills}</span>
          </button>

          <button
            type="button"
            className={`sidebar__menu-button ${sidebarView === 'agents' ? 'is-active' : ''}`}
            onClick={() => setSidebarView('agents')}
          >
            <span className="sidebar__item-icon">◌</span>
            <span className="sidebar__item-label">{t.sidebarAgents}</span>
          </button>

          <button
            type="button"
            className={`sidebar__menu-button ${sidebarView === 'tools' ? 'is-active' : ''}`}
            onClick={() => setSidebarView('tools')}
          >
            <span className="sidebar__item-icon">◌</span>
            <span className="sidebar__item-label">{t.sidebarTools}</span>
          </button>

          <button
            type="button"
            className={`sidebar__menu-button ${sidebarView === 'mcpCallbacks' ? 'is-active' : ''}`}
            onClick={() => setSidebarView('mcpCallbacks')}
          >
            <span className="sidebar__item-icon">◌</span>
            <span className="sidebar__item-label">{t.sidebarMcp}</span>
          </button>
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
        ) : (
          <>
            <header className="chat-topbar chat-topbar--center">
              <div>
                <h1>{t.chatTitle}</h1>
                <p>{t.chatSubtitle}</p>
              </div>
            </header>

            {chatMessages.length === 0 ? (
              <section className="welcome-panel">
                <img className="welcome-panel__image" src={brandYxy} alt="Nebula preview" />
                <h2>{t.welcomeTitle}</h2>
                <p>{t.welcomeBody}</p>
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
                placeholder={t.placeholder}
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
        )}
      </section>
    </main>
  )
}

export default HomePage
