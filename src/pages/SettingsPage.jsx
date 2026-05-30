import { languages, messages } from '@/i18n/messages'

function SettingsIcon({ name }) {
  switch (name) {
    case 'privacy':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7 11V8a5 5 0 0 1 10 0v3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" opacity="0.18" />
          <path
            d="M12 15v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8.5" r="3.5" fill="currentColor" opacity="0.22" />
          <path
            d="M6 19c1.2-3 3.4-4.5 6-4.5s4.8 1.5 6 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'language':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M4 12h16M12 3.5c2.2 2.8 3.4 5.8 3.4 8.5S14.2 17.7 12 20.5M12 3.5C9.8 6.3 8.6 9.3 8.6 12s1.2 5.7 3.4 8.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'help':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="6" width="16" height="12" rx="2.5" fill="currentColor" opacity="0.18" />
          <path
            d="M4 8.5l8 5 8-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'share':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 18.5s-6.5-3.8-6.5-7.2C5.5 8.8 8.4 7 12 9.5c3.6-2.5 6.5-.7 6.5 2.3 0 3.4-6.5 6.7-6.5 6.7Z"
            fill="currentColor"
            opacity="0.22"
          />
        </svg>
      )
    case 'save':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 4.5 5 8v8.5A2.5 2.5 0 0 0 7.5 19h9A2.5 2.5 0 0 0 19 16.5V8l-7-3.5Z"
            fill="currentColor"
            opacity="0.18"
          />
          <path
            d="M9.5 19v-4.5h5V19"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    default:
      return null
  }
}

function ChevronRight() {
  return (
    <svg className="settings-item__chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.5 7.5 14.5 12l-5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SettingsRowButton({ icon, tone, label, trailing, onClick }) {
  return (
    <button type="button" className="settings-item" onClick={onClick}>
      <span className={`settings-item__icon settings-item__icon--${tone}`}>
        <SettingsIcon name={icon} />
      </span>
      <span className="settings-item__label">{label}</span>
      <span className="settings-item__action">
        {trailing}
        <ChevronRight />
      </span>
    </button>
  )
}

function SettingsPage({ language, onLanguageChange, onBack }) {
  const t = messages[language]

  function handleShare() {
    const shareText = `${t.appName} - ${t.brand}`
    if (navigator.share) {
      navigator.share({ title: t.appName, text: shareText }).catch(() => {})
      return
    }

    navigator.clipboard?.writeText(window.location.origin).catch(() => {})
  }

  function handleClearHistory() {
    window.alert(t.settingsClearHistoryHint || t.settingsAutoSaveHistoryDesc)
  }

  return (
    <main className="settings-screen">
      <button type="button" className="settings-close" aria-label={t.settingsClose} onClick={onBack}>
        ×
      </button>

      <div className="settings-screen__content">
        <header className="settings-profile">
          <div className="settings-profile__avatar">{t.profileName.slice(0, 1)}</div>
          <h1>{t.profileName}</h1>
          <p>{t.profileUserId}</p>
          <button type="button" className="settings-profile__manage">
            {t.settingsAccountManage}
          </button>
        </header>

        <section className="settings-card">
          <SettingsRowButton icon="privacy" tone="green" label={t.settingsPrivacy} />
        </section>

        <section className="settings-card">
          <SettingsRowButton icon="profile" tone="blue" label={t.settingsEditProfile} />

          <div className="settings-item settings-item--static">
            <span className="settings-item__icon settings-item__icon--blue">
              <SettingsIcon name="language" />
            </span>
            <span className="settings-item__label">{t.language}</span>
            <span className="settings-item__action">
              <select
                className="settings-select"
                value={language}
                onChange={(event) => onLanguageChange(event.target.value)}
                aria-label={t.language}
              >
                {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </span>
          </div>
        </section>

        <section className="settings-card">
          <SettingsRowButton icon="help" tone="purple" label={t.help} />
          <button type="button" className="settings-item" onClick={handleShare}>
            <span className="settings-item__icon settings-item__icon--red">
              <SettingsIcon name="share" />
            </span>
            <span className="settings-item__label">{t.settingsShare}</span>
            <span className="settings-item__action">
              <ChevronRight />
            </span>
          </button>
        </section>

        <section className="settings-card settings-card--feature">
          <div className="settings-feature">
            <span className="settings-item__icon settings-item__icon--green">
              <SettingsIcon name="save" />
            </span>
            <div className="settings-feature__body">
              <div className="settings-feature__head">
                <strong>{t.settingsAutoSaveHistory}</strong>
              </div>
              <p>{t.settingsAutoSaveHistoryDesc}</p>
              <button type="button" className="settings-feature__link" onClick={handleClearHistory}>
                {t.settingsClearHistory}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default SettingsPage
