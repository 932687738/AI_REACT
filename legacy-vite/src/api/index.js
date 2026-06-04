export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const API = {
  health: '/health',
  superAgents: {
    chat: '/api/super-agents/chat',
    agents: '/api/super-agents/agents',
    agentHealth: (name) => `/api/super-agents/agents/${encodeURIComponent(name)}/health`,
  },
  agentHub: {
    chatKnowledge: '/api/agent-hub/chat/knowledge',
    /** @deprecated 智能体模式请用 superAgents.chat */
    chatAgent: '/api/agent-hub/chat/agent',
    requirementDev: '/api/agent-hub/requirement-dev',
    status: '/api/agent-hub/status',
    knowledgeUpload: '/api/agent-hub/knowledge/upload',
    knowledgeBases: '/api/agent-hub/knowledge-bases',
    knowledgeDocumentsBatchDelete: '/api/agent-hub/knowledge/documents/batch-delete',
    conversationConfigKnowledgeRetrievalThreshold:
      '/api/agent-hub/conversation-config/knowledge-retrieval-threshold',
    conversations: '/api/agent-hub/conversations',
  },
  user: {
    profile: '/user/profile',
  },
}
