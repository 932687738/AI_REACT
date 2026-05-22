# 变更历史

> 以下为基于当前代码快照推断的早期变更，真实顺序可能略有不同，但完整涵盖了所有现有功能。

## 2026-05-20

- [推断][新增] 初始化 React + Vite 项目，创建 `package.json`、`vite.config.js`、`index.html`、`eslint.config.js`
- [推断][新增] 建立基础应用入口 `src/main.jsx`、`src/app/App.jsx`
- [推断][新增] 创建聊天主页面 `src/pages/HomePage.jsx`、设置页 `src/pages/SettingsPage.jsx`
- [推断][新增] 创建全局样式 `src/styles/index.css`
- [推断][新增] 添加资源文件 `src/assets/brand-yxy.png`、`src/assets/hero.png`
- [推断][新增] 建立基础 API 层 `src/api/index.js`、`src/api/chat.js`、`src/utils/request.js`
- [推断][新增] 建立多语言文案 `src/i18n/messages.js`

## 2026-05-20

- [推断][修改] 增加本地语言持久化能力，新增 `src/hooks/useLanguage.js`
- [推断][修改] 增加品牌头像/Logo 相关组件 `src/components/LogoMark.jsx`

## 2026-05-20

- [推断][新增] 首次提交基础工程结构，生成 `README.md`、`.gitignore`、`public/favicon.svg`、`public/icons.svg`

## 2026-05-20

- [推断][修改] 引入聊天流式请求封装，`src/utils/request.js` 增加 `postStream`
- [推断][修改] 调整 `vite.config.js` 代理配置，支持 `/api` 转发到后端

## 2026-05-21

- [推断][新增] 增加后端状态接口封装 `src/api/agentHub.js`
- [推断][修改] 扩展 `src/pages/HomePage.jsx`，加入侧边栏模块、历史对话、技能/智能体/工具/MCP 页面
- [推断][修改] 扩展 `src/i18n/messages.js`，补充聊天页、设置页与技能页文案
- [推断][修改] 扩展 `src/styles/index.css`，实现深色工作台视觉与设置页布局
- [推断][新增] 创建本地历史对话持久化模块 `src/services/conversationHistory.js`

## 2026-05-21

- [推断][修改] 调整 `.env`，增加 `VITE_API_BASE_URL`、`VITE_API_PROXY_TARGET`、`VITE_USE_MOCK_CHAT`
- [推断][修改] 统一聊天请求为 `POST /api/agent-hub/chat`，支持 mock 与后端切换
- [推断][修改] 设置页增加语言切换下拉，支持中英切换

## 2026-05-22

- [新增] 建立项目文档留痕系统，新增 `PROJECT_OVERVIEW.md`、`ARCHITECTURE.md`、`HISTORY.md`、`CHANGELOG.md`、`FILE_STRUCTURE.md`、`PROBLEM_MAPPING.md`、`DOCUMENTATION_GUIDE.md`
- [修改] 新增 `.cursorrules` 与 `CLAUDE.md`，要求 AI 先读文档再改代码
- [修改] 更新 `README.md`，加入 AI 留痕规范提示并指向新的文档体系

