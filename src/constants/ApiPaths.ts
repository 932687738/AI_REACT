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
    models: '/api/agent-hub/model',
    modelList: '/api/agent-hub/model/list',
    modelProviders: '/api/agent-hub/model/providers',
  },
  superAgents: {
    chat: '/api/super-agents/chat',
    agents: '/api/super-agents/agents',
    agentHealth: (name: string) => `/api/super-agents/agents/${encodeURIComponent(name)}/health`,
    agentVariables: (name: string) => `/api/super-agents/agents/${encodeURIComponent(name)}/variables`,
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
    promptsMarketplace: '/api/super-agents/prompts/marketplace',
    promptsMarketplaceFavorites: '/api/super-agents/prompts/marketplace/favorites',
    promptsMarketplaceUse: '/api/super-agents/prompts/marketplace/use',
    promptsMarketplaceSaveGenerated: '/api/super-agents/prompts/marketplace/save-generated',
    promptsGenerate: '/api/super-agents/prompts/generate',
    quickCommands: (agentName: string) =>
      `/api/super-agents/agents/${encodeURIComponent(agentName)}/quick-commands`,
    quickCommand: (agentName: string, id: number) =>
      `/api/super-agents/agents/${encodeURIComponent(agentName)}/quick-commands/${id}`,
  },
  humanLoop: {
    base: '/springai/demo/alibaba-graph/human-loop',
  },
} as const;
