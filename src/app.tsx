import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RequestConfig } from '@umijs/max';
import { getLocale } from '@umijs/max';
import { ConfigProvider, message } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import type { ReactNode } from 'react';
import AppThemeBridge, { resolveAntdThemeConfig } from '@/components/AppThemeBridge';
import { useAppStore, selectTheme } from '@/models/useAppStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export const request: RequestConfig = {
  timeout: 120_000,
  errorConfig: {
    errorHandler(error: { message?: string }) {
      message.error(error?.message || '请求失败，请稍后重试');
    },
  },
};

function ThemedRoot({ children }: { children: ReactNode }) {
  const themeCode = useAppStore(selectTheme);
  const locale = getLocale().startsWith('en') ? enUS : zhCN;

  return (
    <ConfigProvider locale={locale} theme={resolveAntdThemeConfig(themeCode)}>
      <AppThemeBridge />
      {children}
    </ConfigProvider>
  );
}

export function rootContainer(container: ReactNode) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemedRoot>{container}</ThemedRoot>
    </QueryClientProvider>
  );
}
