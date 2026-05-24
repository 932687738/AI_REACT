export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const API = {
  health: '/health',
  agentHub: {
    chatKnowledge: '/api/agent-hub/chat/knowledge',
    chatAgent: '/api/agent-hub/chat/agent',
    requirementDev: '/api/agent-hub/requirement-dev',
    status: '/api/agent-hub/status',
  },
  user: {
    profile: '/user/profile',
  },
}
