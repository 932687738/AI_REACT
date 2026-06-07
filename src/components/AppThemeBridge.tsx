import { theme as antTheme, type ThemeConfig } from 'antd';
import { useEffect } from 'react';
import { applyTheme, isLightTheme, THEMES, type ThemeCode } from '@/constants/theme';
import { useAppStore, selectTheme } from '@/models/useAppStore';

const sharedComponents: ThemeConfig['components'] = {
  Form: {
    labelFontSize: 14,
    verticalLabelPadding: '0 0 6px',
  },
  Table: {
    headerBorderRadius: 10,
    cellPaddingBlock: 12,
    cellPaddingInline: 16,
  },
};

function darkThemeConfig(themeCode: ThemeCode): ThemeConfig {
  const primary = themeCode === THEMES.LV ? '#22c55e' : '#38bdf8';

  return {
    algorithm: antTheme.darkAlgorithm,
    token: {
      colorPrimary: primary,
      colorInfo: primary,
      colorBgBase: '#0a1220',
      colorBgContainer: '#152238',
      colorBgElevated: '#1a2942',
      colorBgLayout: '#060b14',
      colorBorder: 'rgba(148, 163, 184, 0.28)',
      colorBorderSecondary: 'rgba(148, 163, 184, 0.18)',
      colorText: '#e8eef9',
      colorTextSecondary: '#cbd5e1',
      colorTextTertiary: '#94a3b8',
      colorTextQuaternary: '#7c8ba3',
      colorTextPlaceholder: '#8fa0ba',
      colorFillAlter: 'rgba(56, 189, 248, 0.07)',
      colorFillSecondary: 'rgba(148, 163, 184, 0.12)',
      controlOutline: 'rgba(56, 189, 248, 0.18)',
      borderRadius: 10,
    },
    components: {
      ...sharedComponents,
      Input: {
        colorBgContainer: '#132038',
        activeBorderColor: primary,
        hoverBorderColor: 'rgba(56, 189, 248, 0.42)',
        colorTextPlaceholder: '#8fa0ba',
      },
      Select: {
        colorBgContainer: '#132038',
        colorTextPlaceholder: '#8fa0ba',
        optionSelectedBg: 'rgba(56, 189, 248, 0.14)',
      },
      Table: {
        ...sharedComponents?.Table,
        headerBg: '#1a2942',
        headerColor: '#e2e8f0',
        headerSplitColor: 'rgba(148, 163, 184, 0.22)',
        rowHoverBg: 'rgba(56, 189, 248, 0.08)',
        borderColor: 'rgba(148, 163, 184, 0.18)',
        colorText: '#e2e8f0',
        colorTextHeading: '#f1f5f9',
      },
      Button: {
        defaultBg: 'rgba(30, 41, 59, 0.72)',
        defaultBorderColor: 'rgba(148, 163, 184, 0.28)',
        defaultColor: '#e2e8f0',
        defaultHoverBg: 'rgba(51, 65, 85, 0.82)',
        defaultHoverBorderColor: 'rgba(56, 189, 248, 0.35)',
        defaultHoverColor: '#f8fafc',
      },
      Empty: {
        colorTextDescription: '#94a3b8',
      },
      Switch: {
        colorPrimary: '#22c55e',
        handleBg: '#f8fafc',
      },
    },
  };
}

function lightThemeConfig(themeCode: ThemeCode): ThemeConfig {
  const primary = themeCode === THEMES.LV ? '#16a34a' : '#0284c7';

  return {
    algorithm: antTheme.defaultAlgorithm,
    token: {
      colorPrimary: primary,
      colorInfo: primary,
      colorBgBase: '#ffffff',
      colorBgContainer: '#ffffff',
      colorBgElevated: '#f8fafc',
      colorBgLayout: '#f0f9ff',
      colorText: '#0f172a',
      colorTextSecondary: '#475569',
      colorTextPlaceholder: '#64748b',
      borderRadius: 10,
    },
    components: {
      ...sharedComponents,
      Select: {
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        optionSelectedBg: themeCode === THEMES.LV ? 'rgba(34, 197, 94, 0.14)' : 'rgba(186, 230, 253, 0.88)',
        optionActiveBg: themeCode === THEMES.LV ? 'rgba(220, 252, 231, 0.88)' : 'rgba(224, 242, 254, 0.88)',
      },
      Table: {
        ...sharedComponents?.Table,
        headerBg: '#f1f5f9',
        headerColor: '#0f172a',
        headerSplitColor: 'rgba(148, 163, 184, 0.35)',
      },
    },
  };
}

export function resolveAntdThemeConfig(themeCode: ThemeCode): ThemeConfig {
  return isLightTheme(themeCode) ? lightThemeConfig(themeCode) : darkThemeConfig(themeCode);
}

function useThemeDocumentSync() {
  const theme = useAppStore(selectTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
}

export default function AppThemeBridge() {
  useThemeDocumentSync();
  return null;
}
