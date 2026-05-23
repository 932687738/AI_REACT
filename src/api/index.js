export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const API = {
  health: '/health',
  agentHub: {
    chatKnowledge: '/api/agent-hub/chat/knowledge',
    chatAgent: '/api/agent-hub/chat/agent',
    status: '/api/agent-hub/status',
  },
  user: {
    profile: '/user/profile',
  },
}
