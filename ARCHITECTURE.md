# 架构设计

## 组件层级

```text
src/main.jsx
  -> src/app/App.jsx
    -> src/pages/HomePage.jsx
      -> src/pages/SettingsPage.jsx
      -> src/services/conversationHistory.js
      -> src/api/chat.js
      -> src/api/agentHub.js
      -> src/utils/request.js
      -> src/i18n/messages.js
```

## 状态管理

- 采用 React `useState`、`useEffect`、`useMemo`、`useRef`
- 语言状态通过 `src/hooks/useLanguage.js` 持久化到 `localStorage`
- 历史对话与消息通过 `src/services/conversationHistory.js` 持久化到 `localStorage`
- 当前会话、侧边栏选项、设置页状态主要集中在 `src/pages/HomePage.jsx`

## 路由

- 当前未引入路由库
- 页面切换由 `HomePage.jsx` 内部状态控制：
  - `chat`
  - `skills`
  - `agents`
  - `tools`
  - `mcpCallbacks`
  - `settings`

## 外部 API

- `GET /api/agent-hub/status`
  - 用于读取 skills、agents、tools、mcpCallbacks
- `POST /api/agent-hub/chat`
  - 流式聊天接口
  - `conversationId` 和 `message` 由前端构造

## 设计模式

- `src/utils/request.js` 统一封装 `get/post/put/del/postStream`
- `src/api/` 统一管理后端接口路径
- `src/services/conversationHistory.js` 负责本地历史数据的读写与标题生成
- `src/i18n/messages.js` 负责前端文案多语言映射

## 构建与部署

- 开发时通过 Vite 启动本地服务
- `/api` 可通过 `vite.config.js` 代理到后端
- 构建命令为 `npm.cmd run build`
- 生产部署产物位于 `dist/`

