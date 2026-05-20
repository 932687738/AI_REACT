export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const API = {
  health: '/health',
  chat: {
    list: '/chat/list',
    send: '/chat/send',
  },
  user: {
    profile: '/user/profile',
  },
}
