import { defineConfig } from 'umi';

const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:8080';
const mockChatEnabled =
  process.env.HARNESS_E2E_BUILD === '1' || process.env.MOCK_CHAT === 'true';

export default defineConfig({
  npmClient: 'npm',
  esbuildMinifyIIFE: true,
  antd: {},
  request: {},
  locale: {
    default: 'zh-CN',
    baseSeparator: '-',
  },
  define: {
    __MOCK_CHAT__: JSON.stringify(mockChatEnabled ? 'true' : 'false'),
    'process.env.API_BASE': JSON.stringify(process.env.API_BASE || ''),
    'process.env.MOCK_CHAT': JSON.stringify(mockChatEnabled ? 'true' : 'false'),
    'process.env.SUPER_AGENTS_TENANT_ID': JSON.stringify(
      process.env.SUPER_AGENTS_TENANT_ID || 'default',
    ),
  },
  proxy: {
    '/api': {
      target: apiProxyTarget,
      changeOrigin: true,
    },
    '/springai': {
      target: apiProxyTarget,
      changeOrigin: true,
    },
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/BasicLayout',
      routes: [
        { path: '/', redirect: '/chat/knowledge' },
        { path: '/chat/knowledge', component: './chat/knowledge' },
        { path: '/chat/agent', component: './chat/agent' },
        { path: '/chat/requirement-dev', component: './chat/requirement-dev' },
        { path: '/chat/human-review', component: './chat/human-review' },
        { path: '/knowledge/upload', component: './knowledge/upload' },
        { path: '/knowledge/bases', component: './knowledge/bases' },
        { path: '/agent-hub/skills', component: './agent-hub/skills' },
        { path: '/agent-hub/agents', component: './agent-hub/agents' },
        { path: '/agent-hub/tools', component: './agent-hub/tools' },
        { path: '/agent-hub/mcp', component: './agent-hub/mcp' },
        { path: '/settings', component: './settings' },
      ],
    },
  ],
});
