import { API_BASE_URL, API } from '@/api'

function buildUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export function fetchKnowledgeRetrievalThreshold() {
  return fetch(buildUrl(API.agentHub.conversationConfigKnowledgeRetrievalThreshold)).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    return response.json()
  })
}

export function saveKnowledgeRetrievalThreshold(payload) {
  return fetch(buildUrl(API.agentHub.conversationConfigKnowledgeRetrievalThreshold), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    return response.json()
  })
}
