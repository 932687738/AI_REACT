# Changelog

## [2026-06-30] - 流程执行记录（add-ai-flow-orchestration §15）

### Added

- 执行记录页 `/agent-hub/flow-executions`（列表、flowId 筛选、分页）
- 执行详情页 `/agent-hub/flow-executions/:executionId`（概览、输入/输出、节点轨迹 Timeline）
- `listFlowExecutions` / `getFlowExecution` API 客户端
- 侧栏「执行记录」入口

### Backend (ai)

- `GET /api/agent-hub/flow-executions` 分页列表（含 flowName/triggerType/durationMs/tokenUsage）
- `GET /api/agent-hub/flow-executions/{id}` 详情（nodeLogs 含 input/output/duration/error）
- `FlowExecutionQueryApplicationService` + `FlowExecutionController`
- `FlowExecutionQueryServiceTest`

## [2026-06-30] - 流程 MCP 工具注册（add-ai-flow-orchestration §14）

### Added

- 流程管理页「发布为 MCP 工具」按钮（已发布且启用时可见）
- `flowService.registerFlowMcpTool` + `ApiPaths.agentHub.flowRegisterMcp`

### Backend (ai)

- `POST /api/agent-hub/flows/{id}/register-mcp-tool`
- `FlowMcpToolRegistrar` + `FlowToolRegistrationPort` + `FlowDynamicToolCallbackProvider`
- `FlowMcpToolBootstrap` 启动恢复已注册工具；`ToolCatalog.refreshExternalToolCallbacks`

## [2026-06-30] - 流程 invoke/stream API（add-ai-flow-orchestration §13）

### Backend (ai)

- `POST /api/agent-hub/flows/{id}/invoke` 同步执行
- `POST /api/agent-hub/flows/{id}/stream` SSE 执行
- `FlowExecutionStreamTest` / `FlowControllerContractTest`

## [2026-06-30] - Agent 关联 AI 流程（add-ai-flow-orchestration §12）

### Added

- `PlatformAgentRegistryManager` 流程绑定 Drawer + 列表 flowId 列
- `platformAgentRegistryService.getAgentFlowBinding` / `bindAgentFlow`
- prep 预览 `SuperAgentChatPrepPreview.flowId`

### Backend (ai)

- `AgentRegistryEntry.flowId` + MyBatis `flow_id` 映射
- `GET/PUT /api/super-agents/agents/{name}/flow`
- `SuperAgentStreamRoute.FLOW_ENGINE` + `PrepareSuperAgentChatNode` 路由后检查
- `FlowExecutionBridge` / `FlowAccessGuardApplicationService` + `streamApp`

## [2026-06-30] - AI 流程调试 SSE（add-ai-flow-orchestration §10）

### Added

- 设计器底部 `DebugPanel`：调试参数 JSON、SSE 事件日志、画布节点高亮（running/success/error）
- `flowService.debugFlowStream` + `ApiPaths.agentHub.flowDebug`
- `flowDebugSse.ts` SSE 事件解析

### Backend (ai)

- `POST /api/agent-hub/flows/{id}/debug` SSE（`flow_node_start/complete/error`、`flow_complete`）
- `FlowExecutionApplicationService`、`FlowDebugRunner`、`FlowSseFormatter`
- `FlowExecutionRepository.finalizeExecution` 落库 node_logs / duration_ms

## [2026-06-30] - AI 流程管理（add-ai-flow-orchestration §1~§3）

### Added

- 流程管理页 `/agent-hub/flow-management`（列表、筛选、创建、发布、版本历史、回滚、启用/禁用 Switch）
- 流程设计器 `/agent-hub/flow-designer/:flowId`（React Flow 画布、节点面板、Inspector、保存草稿）
- `@xyflow/react` 依赖；`flowDagUtils` 客户端 DAG 校验
- `flowService.ts` + `types/flowManagement.ts`；`ApiPaths.agentHub.flows*`
- 侧栏入口「AI 流程」

### Backend (ai)

- `FlowController` 发布/版本/回滚/启用/禁用 API；`FlowGraphCompiler` + `FlowCompiledGraphRegistry`
- `FlowDefinitionParser`；节点执行器（ai/knowledge/reply/classifier/branch/script/http/subflow）
- `FlowVariableResolver` + `FlowNodeRetryPolicy`（模板变量 / 重试 + node_logs）

## [2026-06-29] - 聊天路由展示模型

### Added

- 智能体聊天路由卡片新增「模型」字段（正文模型 + 路由模型，含厂商）
- SSE `meta` 事件下发 `modelName` / `modelProvider` 等（plain 与 structured 双模式）

### Fixed

- 模型展示与执行链路接入 DB 动态配置 + 厂商开关（不再固定 qwen-turbo）

## [2026-06-29] - Prompt 市场 / 快捷指令

### Added

- Prompt 市场弹窗（分类浏览、搜索、收藏、选用、AI 生成 Tab）
- 快捷指令管理抽屉 + 对话面板快捷按钮组
- `promptMarketplaceService` + `usePromptStore` + `types/promptMarketplace`
- ChatShell 集成「Prompt 市场」「快捷指令」入口

### Backend (ai)

- Flyway `V25__prompt_marketplace.sql`；Prompt/QuickCommand/Favorite 全套 API

## [2026-06-07] - 挂起工作流管理

### Added

- 挂起工作流管理页 `/agent-hub/suspended-workflows`（列表、搜索、详情、恢复 SSE、关闭、删除）
- `platformSuspendedWorkflowService` + `ApiPaths` Webhook 管理端点
- Agent Hub 侧栏「挂起工作流」菜单项

### Backend (ai)

- `SuperAgentWebhookController` 扩展 GET 列表/详情、POST close、DELETE
- `WorkflowSuspendQueryService` / `WorkflowSuspendAdminService`；Flyway `V17` 增加 `closed_at` 与索引

## [2026-06-07] - SuperAgents 前端接口补全

### Added

- 平台 Agent 注册表 `/agent-hub/platform-agents`（列表、注册、健康探测）
- 平台 Tool 摘要 `/agent-hub/platform-tools`（搜索与来源筛选）
- ModelProvider 管理 `/agent-hub/model-providers`（Switch + 重建绑定）
- 未覆盖意图 `/agent-hub/uncovered-intents`
- MCP 页顶栏 `PlatformMcpOpsBar`（POST `/api/super-agents/mcp/refresh`）
- `platformAdminCommon` + 5 个 SuperAgents 管理 service；共享 `PlatformAdminSettingsDrawer`

### Changed

- `platformSkillService` 抽取公共 Header 至 `platformAdminCommon`
- Agent Hub 侧栏新增 4 个「平台 API」菜单项；agents/tools/mcp 快照页行为不变
- ModelProvider 页 Switch 深色主题对比度修复（轨道/边框 + 开/关文案）
- SuperAgents 写操作 service 加 `skipErrorHandler`，避免与全局 errorHandler 重复 toast
- Skill 管理台 publish/status 401 对齐 `handlePlatformUnauthorized`

## [2026-06-03] - 智能体 SSE 进度时间线（P2-SSE）

### Added

- `AgentProgressTimeline`：智能体对话气泡上方展示 `progress` 步骤（step / status / tool 摘要）
- `ConversationMessage.agentProgress`：客户端 SSE 字段（非 OpenAPI）

### Changed

- `useChatStream`：AGENT 模式订阅 `onProgress` 并去重追加步骤
- `SuperAgentSse`：移除仅 `console.debug` 的进度输出，改由 UI 消费

## [2026-06-03] - Skill 管理台（P4-UI）

### Added

- `PlatformSkillManager`：`/agent-hub/skills` 对接 `GET/POST /api/super-agents/skills` 与 `PATCH .../status`
- `platformSkillService`：租户 / 管理员 API Key（sessionStorage）、生命周期状态变更
- 中英文文案 `platformSkill.*`

### Changed

- 技能页由 Agent Hub 只读浏览改为平台 Skill 管理台（发布新版本、状态机）

## [2026-06-03] - Umi 4 全量重构（frontend-umi-refactor）

### Added

- **@umijs/max 4 + TypeScript** 工程：`src/pages` 约定式路由、`src/layouts/BasicLayout`、`harness` CLI
- `src/services/*` 分层（chat、conversation、knowledge、agentHub、humanLoop、conversationConfig）
- `src/utils/StreamSse.ts` SSE 流式；`src/openapi/` typings + `request.ts`
- 三聊天模式 `ChatShell` + `useChatStream`；会话历史 React Query CRUD
- 知识库 CRUD/上传/批量删除；人工审核三 Tab；设置页 + `useAppStore` 三主题
- Agent Hub 四页浏览 + `useAgentHubStatus`
- Playwright 冒烟 E2E（`e2e/smoke.spec.ts`）；`harness build` 含 e2e 门禁

### Changed

- 原 Vite 实现移至 `legacy-vite/`（只读参考）
- 智能体对话对接 `POST /api/super-agents/chat`（`chatService.sendAgentChat`）
- 重写 `ARCHITECTURE.md`；契约引用更新至 `src/services/`

### Removed

- 生产入口 `src/main.jsx` / `src/app/App.jsx` / `src/pages/HomePage.jsx`（已归档至 legacy-vite）

## [2026-06-02] - 智能体模式对接 SuperAgents 新接口

### Changed

- 修改 `src/api/index.js`，新增 `API.superAgents.chat`（`/api/super-agents/chat`）
- 修改 `src/api/chat.js`，`sendAgentChatMessage` 改调平台新接口，请求体仅 `conversationId` + `message`，可选 Header `X-Tenant-Id`（`VITE_SUPER_AGENTS_TENANT_ID`，默认 `default`）
- 修改 `src/constants/chatMode.js` 注释

## [2026-05-31] - LV 主题侧边栏历史区样式修复

### Fixed

- 修复 LV / DZJ 浅色主题下 `.sidebar__history-empty` 仍显示深灰底的问题，补全背景、虚线边框与滚动条主色
- 历史区标题 `.sidebar__module-title` 改为主题色半透明，与主色体系一致

### Changed

- 更新 `custom-theme-planner` skill（`SKILL.md`、`reference.md`），新增浅色主题侧边栏历史区覆盖清单

## [2026-05-31] - LV 绿色主题

### Added

- 新增 `lv` 浅色主题（主色绿 `#16a34a`、辅助色白），沿用 DZJ 交互结构与布局
- 新增 `src/assets/brand-lv.png`，按主题色自动生成品牌头像

### Changed

- 修改 `src/constants/theme.js`，注册 LV 主题与品牌映射
- 修改 `src/styles/index.css`，追加 `[data-theme='lv']` 全局样式覆盖
- 修改 `src/i18n/messages.js`，补充 LV 主题中英文文案
- 更新 `ARCHITECTURE.md`、`PROBLEM_MAPPING.md`

## [2026-05-31] - Custom Theme Planner Skill

### Added

- 新增 `.cursor/skills/custom-theme-planner/SKILL.md`，定义自定义主题需求采集与实现流程
- 新增 `.cursor/skills/custom-theme-planner/reference.md`，记录本项目主题架构集成参考

## [2026-05-31] - 设置页主题切换

### Added

- 新增 `src/constants/theme.js`，定义 DZJ / YXY 主题与品牌头像映射
- 新增 `src/hooks/useTheme.js`，主题偏好持久化到 `localStorage` 并同步 `data-theme`

### Changed

- 修改 `src/pages/SettingsPage.jsx`，新增主题下拉选择；头像改为按主题展示 `brand-dzj` / `brand-yxy`
- 修改 `src/pages/HomePage.jsx`，侧边栏品牌、欢迎区与账户头像随主题切换
- 修改 `src/styles/index.css`，补充 DZJ 浅色（浅蓝 + 白）主题样式
- 修改 `src/i18n/messages.js`，补充主题相关中英文文案
- 更新 `ARCHITECTURE.md`、`FILE_STRUCTURE.md`、`PROBLEM_MAPPING.md`

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
