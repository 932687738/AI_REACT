# 文件结构

```text
.
├── .cursor/
│   └── skills/
│       ├── code-refactor/
│       │   ├── SKILL.md
│       │   └── examples.md
│       └── custom-theme-planner/
│           ├── SKILL.md
│           └── reference.md
├── .env
├── .gitignore
├── CLAUDE.md
├── CHANGELOG.md
├── DOCUMENTATION_GUIDE.md
├── FILE_STRUCTURE.md
├── HISTORY.md
├── PROJECT_OVERVIEW.md
├── PROBLEM_MAPPING.md
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/
│   │   ├── agentHub.js
│   │   ├── chat.js
│   │   └── index.js
│   ├── app/
│   │   └── App.jsx
│   ├── assets/
│   │   ├── brand-dzj.png
│   │   ├── brand-lv.png
│   │   ├── brand-yxy.png
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── LogoMark.jsx
│   │   └── TypewriterText.jsx
│   ├── constants/
│   │   └── theme.js
│   ├── hooks/
│   │   ├── useLanguage.js
│   │   └── useTheme.js
│   ├── i18n/
│   │   └── messages.js
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   └── SettingsPage.jsx
│   ├── services/
│   │   └── conversationHistory.js
│   ├── styles/
│   │   └── index.css
│   └── utils/
│       └── request.js
└── vite.config.js
```

## 核心职责

- `src/components/TypewriterText.jsx`：聊天流式回复打字机展示（知识库 / 智能体 / 项目经理）
- `src/pages/HomePage.jsx`：聊天首页、侧边栏、历史对话、技能/智能体/工具/MCP 视图
- `src/pages/SettingsPage.jsx`：设置页、语言选择与主题切换
- `src/services/conversationHistory.js`：历史对话与消息本地持久化
- `src/utils/request.js`：统一请求封装
- `src/api/`：后端接口路径定义
- `src/i18n/messages.js`：多语言文案
- `src/styles/index.css`：全局视觉与布局

