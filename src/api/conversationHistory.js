import { API } from '@/api'
import { del, get, patch, post } from '@/utils/request'

function conversationPath(conversationId) {
  return `${API.agentHub.conversations}/${encodeURIComponent(conversationId)}`
}

export function listConversations({ mode, ownerId, limit } = {}) {
  const params = {}
  if (mode) {
    params.mode = mode
  }
  if (ownerId) {
    params.ownerId = ownerId
  }
  if (limit) {
    params.limit = String(limit)
  }
  return get(API.agentHub.conversations, params)
}

export function loadConversationMessages(conversationId) {
  return get(`${conversationPath(conversationId)}/messages`)
}

export function upsertConversation(payload) {
  return post(API.agentHub.conversations, payload)
}

export function appendConversationMessage(conversationId, payload) {
  return post(`${conversationPath(conversationId)}/messages`, payload)
}

export function renameConversation(conversationId, title) {
  return patch(conversationPath(conversationId), { title })
}

export function deleteConversation(conversationId) {
  return del(conversationPath(conversationId))
}
