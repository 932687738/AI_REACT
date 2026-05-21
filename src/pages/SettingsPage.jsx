import { useMemo, useState } from 'react'
import { languages, messages } from '@/i18n/messages'

function SettingsPage({ language, onLanguageChange, onBack }) {
  const [languageOpen, setLanguageOpen] = useState(false)
  const t = messages[language]
  const activeLanguage = useMemo(
    () => languages.find((item) => item.code === language) ?? languages[0],
    [language],
  )

  return (
    <main className="settings-screen">
      <header className="settings-screen__header">
        <button type="button" className="settings-back" onClick={onBack}>
          {'<'} {t.back}
        </button>
        <div className="settings-screen__title">
          <h1>{t.settingsTitle}</h1>
          <p>{t.settingsDesc}</p>
        </div>
      </header>

      <section className="settings-screen__body settings-screen__body--single">
        <div className="settings-stack">
          <section className="settings-row settings-row--open">
            <div className="settings-row__icon settings-row__icon--blue">{activeLanguage.icon}</div>
            <div className="settings-row__content">
              <strong>{t.language}</strong>
              <p>{t.languageDesc}</p>
            </div>
            <div className="settings-language-picker">
              <button
                type="button"
                className="settings-language-trigger"
                onClick={() => setLanguageOpen((open) => !open)}
              >
                <span>{activeLanguage.label}</span>
                <span>{languageOpen ? '˄' : '˅'}</span>
              </button>

              {languageOpen ? (
                <div className="settings-language-dropdown">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className={item.code === language ? 'is-active' : ''}
                      onClick={() => {
                        onLanguageChange(item.code)
                        setLanguageOpen(false)
                      }}
                    >
                      <div>
                        <strong>{item.label}</strong>
                        <small>{t[item.nativeLabelKey]}</small>
                      </div>
                      <span>{item.code === language ? '✓' : ''}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="settings-row">
            <div className="settings-row__icon settings-row__icon--purple">VO</div>
            <div className="settings-row__content">
              <strong>{t.voice}</strong>
              <p>{t.appearanceDesc}</p>
            </div>
          </section>

          <section className="settings-row">
            <div className="settings-row__icon settings-row__icon--purple">ME</div>
            <div className="settings-row__content">
              <strong>{t.memory}</strong>
              <p>{t.notificationsDesc}</p>
            </div>
          </section>

          <section className="settings-row">
            <div className="settings-row__icon settings-row__icon--violet">FB</div>
            <div className="settings-row__content">
              <strong>{t.help}</strong>
              <p>{t.accountDesc}</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default SettingsPage
