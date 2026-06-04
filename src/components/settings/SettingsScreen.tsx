import {
  GlobalOutlined,
  LockOutlined,
  QuestionCircleOutlined,
  ShareAltOutlined,
  UserOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import { getLocale, history, setLocale, useIntl } from '@umijs/max';
import { Avatar, Button, Select } from 'antd';
import { themeOptions, resolveBrandMark } from '@/constants/theme';
import { useAppStore, selectTheme } from '@/models/useAppStore';
import styles from './settings.less';

const LOCALE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
];

export default function SettingsScreen() {
  const intl = useIntl();
  const theme = useAppStore(selectTheme);
  const setTheme = useAppStore((state) => state.setTheme);

  function handleShare() {
    const shareText = `${intl.formatMessage({ id: 'layout.appName' })} - ${intl.formatMessage({ id: 'layout.brandTagline' })}`;
    if (navigator.share) {
      void navigator.share({ title: intl.formatMessage({ id: 'layout.appName' }), text: shareText }).catch(() => {});
      return;
    }
    void navigator.clipboard?.writeText(window.location.origin);
  }

  function handleClearHistoryHint() {
    window.alert(intl.formatMessage({ id: 'settings.autoSaveHistoryDesc' }));
  }

  return (
    <main className={`nebula-settings-screen ${styles.screen}`}>
      <Button
        type="text"
        className={styles.close}
        aria-label={intl.formatMessage({ id: 'settings.close' })}
        onClick={() => history.push('/chat/knowledge')}
      >
        ×
      </Button>

      <div className={styles.content}>
        <header className={`nebula-settings-profile ${styles.profile}`}>
          <Avatar
            size={88}
            className={styles.avatar}
            src={resolveBrandMark(theme)}
            alt={intl.formatMessage({ id: 'layout.appName' })}
          />
          <h1>{intl.formatMessage({ id: 'layout.profile.name' })}</h1>
          <p>{intl.formatMessage({ id: 'settings.profileUserId' })}</p>
          <Button className={styles.manageBtn}>{intl.formatMessage({ id: 'settings.accountManage' })}</Button>
        </header>

        <section className={`nebula-settings-card ${styles.card}`}>
          <button type="button" className={`nebula-settings-item ${styles.row}`}>
            <span className={`${styles.icon} ${styles.iconGreen}`}>
              <LockOutlined />
            </span>
            <span className={styles.label}>{intl.formatMessage({ id: 'settings.privacy' })}</span>
          </button>
        </section>

        <section className={`nebula-settings-card ${styles.card}`}>
          <button type="button" className={`nebula-settings-item ${styles.row}`}>
            <span className={`${styles.icon} ${styles.iconBlue}`}>
              <UserOutlined />
            </span>
            <span className={styles.label}>{intl.formatMessage({ id: 'settings.editProfile' })}</span>
          </button>

          <div className={`${styles.row} ${styles.rowStatic}`}>
            <span className={`${styles.icon} ${styles.iconBlue}`}>
              <GlobalOutlined />
            </span>
            <span className={styles.label}>{intl.formatMessage({ id: 'settings.language' })}</span>
            <Select
              className={styles.select}
              value={getLocale()}
              options={LOCALE_OPTIONS}
              aria-label={intl.formatMessage({ id: 'settings.language' })}
              onChange={(value) => setLocale(value, false)}
            />
          </div>

          <div className={`${styles.row} ${styles.rowStatic}`}>
            <span className={`${styles.icon} ${styles.iconPurple}`}>
              <BgColorsOutlined />
            </span>
            <span className={styles.label}>{intl.formatMessage({ id: 'settings.theme' })}</span>
            <Select
              className={styles.select}
              value={theme}
              options={themeOptions.map((item) => ({
                value: item.code,
                label: intl.formatMessage({ id: item.labelId }),
              }))}
              aria-label={intl.formatMessage({ id: 'settings.theme' })}
              onChange={(value) => setTheme(value)}
            />
          </div>
        </section>

        <section className={`nebula-settings-card ${styles.card}`}>
          <button type="button" className={`nebula-settings-item ${styles.row}`}>
            <span className={`${styles.icon} ${styles.iconPurple}`}>
              <QuestionCircleOutlined />
            </span>
            <span className={styles.label}>{intl.formatMessage({ id: 'settings.help' })}</span>
          </button>
          <button type="button" className={`nebula-settings-item ${styles.row}`} onClick={handleShare}>
            <span className={`${styles.icon} ${styles.iconRed}`}>
              <ShareAltOutlined />
            </span>
            <span className={styles.label}>{intl.formatMessage({ id: 'settings.share' })}</span>
          </button>
        </section>

        <section className={`nebula-settings-card nebula-settings-feature ${styles.card} ${styles.featureCard}`}>
          <div className={styles.feature}>
            <span className={`${styles.icon} ${styles.iconGreen}`}>
              <LockOutlined />
            </span>
            <div>
              <strong>{intl.formatMessage({ id: 'settings.autoSaveHistory' })}</strong>
              <p>{intl.formatMessage({ id: 'settings.autoSaveHistoryDesc' })}</p>
              <button type="button" className={styles.link} onClick={handleClearHistoryHint}>
                {intl.formatMessage({ id: 'settings.clearHistory' })}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
