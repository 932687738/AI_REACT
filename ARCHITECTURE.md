# Nebula Desk 架构（Umi 4 + TypeScript）

> 原 Vite 实现已归档至 `legacy-vite/`，仅供 API/UX 对照，**禁止**作为生产入口。

## 技术栈

| 层 | 选型 |
|----|------|
| 框架 | React 18 + **@umijs/max 4** + TypeScript |
| UI | Ant Design 5 |
| 服务端状态 | TanStack React Query |
| 客户端偏好 | Zustand（`useAppStore`：theme、sidebarCollapsed） |
| 工程 CLI | `harness`（`scripts/harness.mjs`） |
| E2E | Playwright（`e2e/`，`harness build` 门禁） |

## 目录结构

```text
src/
├── app.tsx                 # ConfigProvider + QueryClient + request 错误拦截
├── global.less             # 全局样式 + 三主题 CSS 变量
├── layouts/BasicLayout/    # 侧栏三模块、顶栏、Outlet、历史会话
├── pages/                  # 约定式路由页面
├── components/             # ChatShell、humanLoop、settings、agentHub、knowledge
├── services/               # REST/SSE 封装（唯一对外 API 层）
├── hooks/                  # useChatStream、useConversationHistory、useAgentHubStatus
├── models/useAppStore.ts   # Zustand 持久化
├── openapi/                # typings.d.ts + request.ts（OpenAPI 手维护/生成）
├── utils/StreamSse.ts      # SSE fetch（chat 专用，非 Umi request）
└── constants/ApiPaths.ts   # 路径常量
openapi-spec/               # agent-hub.openapi.yaml 降级真源
legacy-vite/                # 已弃用 Vite 参考实现
e2e/                        # Playwright 冒烟
```

## 路由（`.umirc.ts`）

| 路径 | 页面 |
|------|------|
| `/chat/knowledge` | 知识库对话 |
| `/chat/agent` | 智能体对话（SuperAgents SSE） |
| `/chat/requirement-dev` | 项目经理对话 |
| `/chat/human-review` | 人工审核工作台 |
| `/knowledge/bases` | 知识库 CRUD |
| `/knowledge/upload` | 文档上传 |
| `/agent-hub/skills` | **Skill 管理台**（SuperAgents 发布 / 生命周期） |
| `/agent-hub/platform-agents` | **平台 Agent 注册表**（SuperAgents GET/POST agents） |
| `/agent-hub/platform-tools` | **平台 Tool 摘要**（GET tools） |
| `/agent-hub/model-providers` | **ModelProvider 开关** |
| `/agent-hub/uncovered-intents` | **未覆盖意图**复盘 |
| `/agent-hub/suspended-workflows` | **挂起工作流**管理（列表 / 恢复 / 关闭 / 删除） |
| `/agent-hub/agents` … `/mcp` | Agent Hub 运行时浏览（status 快照）；MCP 页顶栏含平台 refresh |
| `/settings` | 设置（主题/语言/阈值） |

## Services 与契约映射

| 契约路径 | Service |
|----------|---------|
| `POST /api/agent-hub/chat/knowledge` | `chatService.sendKnowledgeChat` |
| `POST /api/super-agents/chat` | `chatService.sendAgentChat` |
| `POST /api/agent-hub/requirement-dev` | `chatService.sendRequirementDevChat` |
| `GET /api/agent-hub/status` | `agentHubService.getAgentHubStatus` |
| `GET/POST /api/super-agents/skills` | `platformSkillService` |
| `PATCH /api/super-agents/skills/{name}/versions/{v}/status` | `platformSkillService.transitionPlatformSkillStatus` |
| `GET/POST /api/super-agents/agents` | `platformAgentRegistryService` |
| `POST /api/super-agents/agents/{name}/health` | `platformAgentRegistryService.probePlatformAgentHealth` |
| `GET /api/super-agents/tools` | `platformToolCatalogService` |
| `GET/PATCH /api/super-agents/model-providers` | `platformModelProviderService` |
| `POST /api/super-agents/model-providers/refresh` | `platformModelProviderService.refreshModelProviders` |
| `GET /api/super-agents/uncovered-intents` | `platformUncoveredIntentService` |
| `POST /api/super-agents/mcp/refresh` | `platformMcpAdminService` |
| `GET /api/super-agents/hooks/suspended` 等 | `platformSuspendedWorkflowService` |
| `POST /api/super-agents/hooks/resume` | `platformSuspendedWorkflowService.resumeSuspendedWorkflow` |
| 租户 / Admin Key Header | `platformAdminCommon`（各 SuperAgents 管理 service 共用） |
| `/api/agent-hub/knowledge-bases` CRUD | `knowledgeService` |
| `POST .../knowledge/upload` | `knowledgeService.uploadDocument` |
| `POST .../batch-delete` | `knowledgeService.batchDeleteDocuments` |
| `/api/agent-hub/conversations` 系列 | `conversationService` + `conversationPersist` |
| `GET/PUT .../knowledge-retrieval-threshold` | `conversationConfigService` |
| `/springai/demo/.../human-loop/*` | `humanLoopService`（Demo HIL） |

SSE 解析：`utils/StreamSse.ts`；知识库 meta/citations：`utils/KnowledgeCitation.ts`。

## 状态与主题

- **语言**：Umi locale 插件（`zh-CN` / `en-US`），设置页 `setLocale`
- **主题**：`useAppStore.theme` → `document.documentElement.dataset.theme`（`dzj` / `lv` / `yxy`）
- **会话**：`ChatSessionProvider` 按 `chatMode` 隔离 `conversationId`；历史走 React Query + 后端 CRUD

## 开发与构建

```powershell
cd ai_react
harness install    # npm install + playwright chromium
harness dev        # max dev，代理 /api、/springai
harness lint
harness build      # MOCK_CHAT=true build + Playwright e2e
```

环境变量见 `.env.example`：`API_PROXY_TARGET`、`MOCK_CHAT`、`SUPER_AGENTS_TENANT_ID`。

## 代理

开发环境 `.umirc.ts` 将 `/api`、`/springai` 代理至 `API_PROXY_TARGET`（默认 `http://localhost:8080`）。
