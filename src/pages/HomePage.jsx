import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [conversationId, setConversationId] = useState(() => createConversationId())
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
      {
        id: userMessageId,
        role: 'user',
        kind: 'text',
        text: message,
      },
      { id: assistantMessageId, role: 'assistant', kind: 'text', text: '', pending: true },
    ])

    try {
      await sendChatMessage(
        {
          conversationId,
          message,
          language,
        },
        {
          onChunk: (chunk) => {
            setChatMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? {
                      ...item,
                      text: `${item.text}${chunk}`,
                      pending: false,
                    }
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
    } catch (error) {
      setChatMessages((current) =>
        current.map((item) =>
          item.id === assistantMessageId
            ? {
                ...item,
                text: t.errorMessage,
                pending: false,
                error: true,
              }
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
    setChatMessages([])
    setInputValue('')
    setConversationId(createConversationId())
    setMenuOpen(false)
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
          <img className="brand-mark" src={brandYxy} alt="YXY brand logo" />
          <div>
            <strong>{t.appName}</strong>
            <p>{t.brand}</p>
          </div>
        </div>

        <button className="sidebar__newchat" type="button" onClick={handleNewChat}>
          + {t.newChat}
        </button>

        <div className="sidebar__section">
          <div className="sidebar__section-head">
            <span className="sidebar__label">{t.recentChats}</span>
          </div>
          <ul className="sidebar__list">
            {t.history.map((item, index) => (
              <li key={item}>
                <button className={index === 0 ? 'is-active' : ''} type="button">
                  {item}
                </button>
              </li>
            ))}
          </ul>
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
        <header className="chat-topbar chat-topbar--center">
          <div>
            <h1>{t.chatTitle}</h1>
            <p>{t.chatSubtitle}</p>
          </div>
        </header>

        {chatMessages.length === 0 ? (
          <section className="welcome-panel">
            <img className="welcome-panel__image" src={brandYxy} alt="YXY preview" />
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
      </section>
    </main>
  )
}

export default HomePage
