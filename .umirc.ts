import { defineConfig } from 'umi';

const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:8080';
const mockChatEnabled =
  process.env.HARNESS_E2E_BUILD === '1' || process.env.MOCK_CHAT === 'true';
/** 空字符串时 JSON.stringify('') 会注入字面量 ""，导致 fetch 相对路径错乱 */
const apiBaseDefine =
  process.env.API_BASE && process.env.API_BASE.trim().length > 0
    ? JSON.stringify(process.env.API_BASE)
    : "''";

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
    'process.env.API_BASE': apiBaseDefine,
    'process.env.MOCK_CHAT': JSON.stringify(mockChatEnabled ? 'true' : 'false'),
    'process.env.SUPER_AGENTS_TENANT_ID':
      process.env.SUPER_AGENTS_TENANT_ID && process.env.SUPER_AGENTS_TENANT_ID.trim().length > 0
        ? JSON.stringify(process.env.SUPER_AGENTS_TENANT_ID.trim())
        : "'default'",
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
    { path: '/share/:shareId', component: './share/$shareId', layout: false },
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
        { path: '/agent-hub/platform-agents', component: './agent-hub/platform-agents' },
        { path: '/agent-hub/platform-tools', component: './agent-hub/platform-tools' },
        { path: '/agent-hub/model-providers', component: './agent-hub/model-providers' },
        { path: '/agent-hub/models', component: './agent-hub/models' },
        { path: '/agent-hub/uncovered-intents', component: './agent-hub/uncovered-intents' },
        { path: '/agent-hub/suspended-workflows', component: './agent-hub/suspended-workflows' },
        { path: '/agent-hub/prompt-management', component: './prompt-management' },
        { path: '/settings', component: './settings' },
      ],
    },
  ],
});
