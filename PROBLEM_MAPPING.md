# 问题映射

| 功能/问题 | 相关文件 |
| --- | --- |
| 启动入口与页面加载 | `src/main.jsx`, `src/app/App.jsx`, `src/pages/HomePage.jsx` |
| 聊天消息发送与流式响应 | `src/api/chat.js`, `src/utils/request.js`, `src/pages/HomePage.jsx`, `src/components/TypewriterText.jsx` |
| 知识库 / 智能体 / 项目经理对话打字机特效 | `src/components/TypewriterText.jsx`, `src/pages/HomePage.jsx` |
| 后端状态数据（modules / skills / agents / tools / mcp） | `src/api/agentHub.js`, `src/pages/HomePage.jsx` |
| 历史对话保存与回放 | `src/services/conversationHistory.js`, `src/pages/HomePage.jsx` |
| 多语言切换 | `src/hooks/useLanguage.js`, `src/i18n/messages.js`, `src/pages/SettingsPage.jsx` |
| 主题切换（DZJ / LV / YXY） | `src/hooks/useTheme.js`, `src/constants/theme.js`, `src/pages/SettingsPage.jsx`, `src/pages/HomePage.jsx`, `src/styles/index.css` |
| 设置页交互 | `src/pages/SettingsPage.jsx`, `src/styles/index.css` |
| 全局样式和布局 | `src/styles/index.css` |
| 环境变量与代理 | `.env`, `vite.config.js`, `README.md` |
| API 路径统一管理 | `src/api/index.js` |
