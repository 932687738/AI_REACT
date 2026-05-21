export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const API = {
  health: '/health',
  agentHub: {
    chat: '/api/agent-hub/chat',
    status: '/api/agent-hub/status',
  },
  user: {
    profile: '/user/profile',
  },
}
