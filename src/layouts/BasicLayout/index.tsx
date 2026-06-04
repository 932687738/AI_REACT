import {
  CommentOutlined,
  DatabaseOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { resolveBrandMark } from '@/constants/theme';
import { useAppStore, selectSidebarCollapsed, selectTheme } from '@/models/useAppStore';
import { history, Outlet, useIntl, useLocation, SelectLang } from '@umijs/max';
import { Avatar, Button, Dropdown, Layout } from 'antd';
import { ROUTES, isChatRoute } from '@/constants/routes';
import { chatModeFromPath } from '@/utils/chatModeFromPath';
import { ChatSessionProvider, useChatSession } from '@/context/ChatSessionProvider';
import ConversationHistoryPanel from './ConversationHistoryPanel';
import { resolveModuleIdFromPath, SIDEBAR_MODULES } from './menuConfig';
import type { SidebarModuleGroup, SidebarModuleId } from './types';
import styles from './index.less';

const { Sider, Header, Content } = Layout;

function moduleIcon(id: SidebarModuleGroup['id']) {
  if (id === 'knowledge') {
    return <DatabaseOutlined aria-hidden />;
  }
  if (id === 'agentHub') {
    return <RobotOutlined aria-hidden />;
  }
  return <CommentOutlined aria-hidden />;
}

function isNavItemActive(activePath: string, itemPath: string) {
  return activePath === itemPath || activePath.startsWith(`${itemPath}/`);
}

function SidebarModuleSection({
  module,
  collapsed,
  expanded,
  activePath,
  onToggle,
  onNavigate,
}: {
  module: SidebarModuleGroup;
  collapsed: boolean;
  expanded: boolean;
  activePath: string;
  onToggle: () => void;
  onNavigate: (path: string) => void;
}) {
  const intl = useIntl();
  const moduleTitle = intl.formatMessage({ id: module.titleId });
  const hasActiveChild = module.items.some((item) => isNavItemActive(activePath, item.path));

  if (collapsed) {
    return (
      <section className={styles.module} aria-label={moduleTitle}>
        <Dropdown
          trigger={['click']}
          placement="rightTop"
          align={{ offset: [10, 0] }}
          getPopupContainer={() => document.body}
          overlayClassName={`${styles.moduleDropdownOverlay} nebula-sidebar-module-dropdown`}
          dropdownRender={() => (
            <div className={styles.moduleDropdownPanel}>
              <div className={styles.moduleDropdownHeader}>{moduleTitle}</div>
              <div className={styles.moduleDropdownList} role="menu">
                {module.items.map((item) => {
                  const isActive = isNavItemActive(activePath, item.path);
                  const label = intl.formatMessage({ id: item.labelId });
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="menuitem"
                      className={`${styles.moduleDropdownItem} nebula-nav-item ${isActive ? `${styles.moduleDropdownItemActive} nebula-nav-item-active` : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => onNavigate(item.path)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        >
          <button
            type="button"
            className={`${styles.moduleTrigger} ${styles.moduleTriggerCollapsed} nebula-module-trigger ${hasActiveChild ? `${styles.moduleTriggerActive} nebula-module-trigger-active` : ''}`}
            aria-label={moduleTitle}
            aria-haspopup="menu"
          >
            <span className={styles.moduleTriggerIcon}>{moduleIcon(module.id)}</span>
          </button>
        </Dropdown>
      </section>
    );
  }

  return (
    <section
      className={`${styles.module} ${expanded ? styles.moduleExpanded : ''}`}
      aria-label={moduleTitle}
    >
      <button
        type="button"
        className={`${styles.moduleTrigger} nebula-module-trigger ${hasActiveChild ? `${styles.moduleTriggerActive} nebula-module-trigger-active` : ''}`}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span className={styles.moduleTriggerIcon}>{moduleIcon(module.id)}</span>
        <span className={styles.moduleTriggerTitle}>{moduleTitle}</span>
        <DownOutlined
          className={`${styles.moduleTriggerArrow} ${expanded ? styles.moduleTriggerArrowOpen : ''}`}
          aria-hidden
        />
      </button>
      {expanded ? (
        <nav className={styles.moduleNav} aria-label={moduleTitle}>
          {module.items.map((item) => {
            const isActive = isNavItemActive(activePath, item.path);
            return (
              <button
                key={item.key}
                type="button"
                className={`${styles.navItem} nebula-nav-item ${isActive ? `${styles.navItemActive} nebula-nav-item-active` : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate(item.path)}
              >
                {intl.formatMessage({ id: item.labelId })}
              </button>
            );
          })}
        </nav>
      ) : null}
    </section>
  );
}

function HistorySlot({ visible }: { visible: boolean }) {
  const chatMode = chatModeFromPath(useLocation().pathname);
  if (!visible) {
    return null;
  }
  return <ConversationHistoryPanel chatMode={chatMode} />;
}

function BasicLayoutFrame() {
  const intl = useIntl();
  const location = useLocation();
  const theme = useAppStore(selectTheme);
  const collapsed = useAppStore(selectSidebarCollapsed);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const toggleSidebarCollapsed = useAppStore((state) => state.toggleSidebarCollapsed);
  const [expandedModuleId, setExpandedModuleId] = useState<SidebarModuleId | null>(() =>
    resolveModuleIdFromPath(location.pathname),
  );

  useEffect(() => {
    setExpandedModuleId(resolveModuleIdFromPath(location.pathname));
  }, [location.pathname]);

  const { startNewConversationForMode } = useChatSession();
  const showHistory = isChatRoute(location.pathname);
  const fillViewport = isChatRoute(location.pathname);

  const handleNavigate = (path: string) => {
    if (isChatRoute(path)) {
      startNewConversationForMode(chatModeFromPath(path));
    }
    if (location.pathname !== path) {
      history.push(path);
    }
    setExpandedModuleId(resolveModuleIdFromPath(path));
  };

  const profileMenu = {
    items: [
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: intl.formatMessage({ id: 'layout.profile.settings' }),
        onClick: () => history.push(ROUTES.SETTINGS),
      },
      {
        key: 'logout',
        label: intl.formatMessage({ id: 'layout.profile.logout' }),
        disabled: true,
      },
    ],
  };

  return (
      <Layout className={`${styles.shell} nebula-layout`}>
      <Sider
        className={`${styles.sider} nebula-sider`}
        width={260}
        collapsedWidth={72}
        collapsible
        collapsed={collapsed}
        onCollapse={setSidebarCollapsed}
        trigger={null}
        breakpoint="lg"
        onBreakpoint={(broken) => setSidebarCollapsed(broken)}
      >
        <div className={styles.siderInner}>
        <div className={`${styles.brand} nebula-brand`}>
          <Avatar
            className={styles.brandMark}
            shape="square"
            size={40}
            src={resolveBrandMark(theme)}
            alt={intl.formatMessage({ id: 'layout.appName' })}
          />
          {!collapsed ? (
            <div className={styles.brandCopy}>
              <strong>{intl.formatMessage({ id: 'layout.appName' })}</strong>
              <span>{intl.formatMessage({ id: 'layout.brandTagline' })}</span>
            </div>
          ) : null}
        </div>

        <div className={styles.sidebarScroll}>
          {SIDEBAR_MODULES.map((module) => (
            <SidebarModuleSection
              key={module.id}
              module={module}
              collapsed={collapsed}
              expanded={!collapsed && expandedModuleId === module.id}
              activePath={location.pathname}
              onToggle={() =>
                setExpandedModuleId((current) => (current === module.id ? null : module.id))
              }
              onNavigate={handleNavigate}
            />
          ))}

          {!collapsed ? <HistorySlot visible={showHistory} /> : null}
        </div>

        <div className={`${styles.profile} nebula-profile`}>
          <Dropdown menu={profileMenu} trigger={['click']} placement="topLeft">
            <button type="button" className={`${styles.profileTrigger} nebula-profile-trigger`}>
              <Avatar
                size={32}
                className={styles.profileAvatar}
                src={resolveBrandMark(theme)}
                alt={intl.formatMessage({ id: 'layout.profile.name' })}
              />
              {!collapsed ? (
                <span className={`${styles.profileName} nebula-profile-name`}>
                  {intl.formatMessage({ id: 'layout.profile.name' })}
                </span>
              ) : null}
            </button>
          </Dropdown>
        </div>
        </div>
      </Sider>

      <Layout className={styles.main}>
        <Header className={styles.header}>
          <Button
            type="text"
            className={styles.collapseTrigger}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            aria-label={intl.formatMessage({ id: 'layout.top.toggleSidebar' })}
            onClick={() => toggleSidebarCollapsed()}
          />
          <div className={styles.headerSpacer} />
          <div className={styles.headerActions}>
            <SelectLang />
            <Button
              type="text"
              icon={<SettingOutlined />}
              aria-label={intl.formatMessage({ id: 'layout.top.settings' })}
              onClick={() => history.push(ROUTES.SETTINGS)}
            />
          </div>
        </Header>
        <Content className={`${styles.content} ${fillViewport ? styles.contentFill : ''}`}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default function BasicLayout() {
  return (
    <ChatSessionProvider>
      <BasicLayoutFrame />
    </ChatSessionProvider>
  );
}
