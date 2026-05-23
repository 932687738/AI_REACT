/**
 * 前端聊天模式常量（与后端 AgentHubChatMode 语义对齐）。
 * 知识库与智能体使用独立 API：/chat/knowledge 与 /chat/agent。
 */
export const CHAT_MODE = {
  /** 仅向量知识库 RAG，无子智能体、无工具 */
  KNOWLEDGE: 'knowledge',
  /** 意图路由 + 子智能体 + 工具，不检索知识库 */
  AGENT: 'agent',
}

/** 默认走知识库对话 */
export const DEFAULT_CHAT_MODE = CHAT_MODE.KNOWLEDGE

/** 侧边栏视图与聊天模式映射 */
export const SIDEBAR_CHAT_VIEW = {
  KNOWLEDGE: 'knowledgeChat',
  AGENT: 'agentChat',
}

/** 智能体对话下可浏览的运行时菜单视图 */
export const AGENT_HUB_VIEWS = ['skills', 'agents', 'tools', 'mcpCallbacks']
