# Changelog

## [2026-05-30] - 侧边栏模块下拉导航

### Added

- 新增 `src/components/SidebarModuleDropdown.jsx`，封装侧边栏模块折叠下拉交互

### Changed

- 修改 `src/pages/HomePage.jsx`，对话 / 知识库 / 能力三组菜单改为按模块下拉选择；历史对话区域保持列表展示
- 修改 `src/styles/index.css`，补充模块下拉触发器与折叠态样式

## [2026-05-27] - 全聊天模式打字机特效

### Changed

- 修改 `src/pages/HomePage.jsx`，智能体对话与项目经理模式同样使用 `TypewriterText` 展示流式回复
- 三种聊天模式流式期间统一保持 `pending: true`，直至 `onComplete`
- 更新 `PROBLEM_MAPPING.md`

## [2026-05-27] - 知识库对话打字机特效

### Added

- 新增 `src/components/TypewriterText.jsx`，用于流式回复逐字展示与 backlog 加速补齐

### Changed

- 修改 `src/pages/HomePage.jsx`，知识库模式下助手消息使用打字机组件；流式期间保持 `pending` 直至完成
- 更新 `FILE_STRUCTURE.md`、`PROBLEM_MAPPING.md`

## [2026-05-22] - 建立文档留痕系统

### Added

- 新增 `PROJECT_OVERVIEW.md`
- 新增 `ARCHITECTURE.md`
- 新增 `HISTORY.md`
- 新增 `CHANGELOG.md`
- 新增 `FILE_STRUCTURE.md`
- 新增 `PROBLEM_MAPPING.md`
- 新增 `DOCUMENTATION_GUIDE.md`
- 新增 `.cursorrules`
- 新增 `CLAUDE.md`

### Changed

- 更新 `README.md`，加入 AI 留痕提示并指向新文档

## [2026-05-22] - 适配 Agent Hub status 接口变更

### Changed

- 修改 `src/api/agentHub.js`，为 `/api/agent-hub/status` 增加 `locale` 查询参数并适配新返回结构
- 修改 `src/pages/HomePage.jsx`，支持展示 `modules` 数据并解析多语言描述、示例信息
- 修改 `src/i18n/messages.js`，补充模块文档与示例相关文案
- 更新 `ARCHITECTURE.md`、`PROBLEM_MAPPING.md`，同步新的接口说明

## [2026-05-22] - 移除模块文档展示

### Changed

- 修改 `src/pages/HomePage.jsx`，从 Skills 页面移除模块文档展示区块
- 修改 `src/i18n/messages.js`，删除未使用的模块文档文案
