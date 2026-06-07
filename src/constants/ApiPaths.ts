/** 仅路径常量，非 DTO */
export const API_PATHS = {
  agentHub: {
    chatKnowledge: '/api/agent-hub/chat/knowledge',
    requirementDev: '/api/agent-hub/requirement-dev',
    status: '/api/agent-hub/status',
    knowledgeUpload: '/api/agent-hub/knowledge/upload',
    knowledgeBases: '/api/agent-hub/knowledge-bases',
    knowledgeDocumentsBatchDelete: '/api/agent-hub/knowledge/documents/batch-delete',
    conversationConfigKnowledgeRetrievalThreshold:
      '/api/agent-hub/conversation-config/knowledge-retrieval-threshold',
    conversations: '/api/agent-hub/conversations',
    shares: '/api/agent-hub/shares',
  },
  superAgents: {
    chat: '/api/super-agents/chat',
    agents: '/api/super-agents/agents',
    agentHealth: (name: string) => `/api/super-agents/agents/${encodeURIComponent(name)}/health`,
    skills: '/api/super-agents/skills',
    skillStatus: (name: string, version: number) =>
      `/api/super-agents/skills/${encodeURIComponent(name)}/versions/${version}/status`,
    tools: '/api/super-agents/tools',
    modelProviders: '/api/super-agents/model-providers',
    modelProvider: (providerId: string) =>
      `/api/super-agents/model-providers/${encodeURIComponent(providerId)}`,
    modelProvidersRefresh: '/api/super-agents/model-providers/refresh',
    uncoveredIntents: '/api/super-agents/uncovered-intents',
    mcpRefresh: '/api/super-agents/mcp/refresh',
    suspendedWorkflows: '/api/super-agents/hooks/suspended',
    suspendedWorkflow: (resumeToken: string) =>
      `/api/super-agents/hooks/suspended/${encodeURIComponent(resumeToken)}`,
    suspendedWorkflowClose: (resumeToken: string) =>
      `/api/super-agents/hooks/suspended/${encodeURIComponent(resumeToken)}/close`,
    hooksResume: '/api/super-agents/hooks/resume',
  },
  humanLoop: {
    base: '/springai/demo/alibaba-graph/human-loop',
  },
} as const;
