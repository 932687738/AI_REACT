import {
  appendConversationMessage,
  deleteConversation as deleteConversationApi,
  listConversations,
  loadConversationMessages as loadConversationMessagesApi,
  renameConversation,
  upsertConversation,
} from '@/api/conversationHistory'
import { CHAT_MODE } from '@/constants/chatMode'

function toApiMode(chatMode) {
  if (chatMode === CHAT_MODE.AGENT) {
    return 'agent'
  }
  if (chatMode === CHAT_MODE.REQUIREMENT_DEV) {
    return 'requirement-dev'
  }
  return 'knowledge'
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const id = String(item.id || '').trim()
  if (!id) {
    return null
  }

  const preview = String(item.preview || '').trim()
  const title = String(item.title || preview || '暂无聊天内容').trim()
  const mode = item.mode === 'requirement-dev' ? CHAT_MODE.REQUIREMENT_DEV : item.mode

  return {
    ...item,
    id,
    title,
    preview,
    mode: mode || CHAT_MODE.KNOWLEDGE,
    updatedAt: Number(item.updatedAt) || Date.now(),
  }
}

function normalizeMessage(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const id = String(item.id || '').trim()
  if (!id) {
    return null
  }

  return {
    ...item,
    id,
    role: item.role === 'assistant' ? 'assistant' : 'user',
    kind: String(item.kind || 'text'),
    text: String(item.text || ''),
    pending: Boolean(item.pending),
    error: Boolean(item.error),
    meta: item.meta ?? undefined,
  }
}

export async function fetchConversationHistory(chatMode) {
  const items = await listConversations({ mode: toApiMode(chatMode), limit: 50 })
  return (Array.isArray(items) ? items : []).map(normalizeItem).filter(Boolean)
}

export async function fetchConversationMessages(conversationId) {
  try {
    const messages = await loadConversationMessagesApi(conversationId)
    return (Array.isArray(messages) ? messages : []).map(normalizeMessage).filter(Boolean)
  } catch {
    // 会话尚未落库（如刚发送首条消息、流式未结束）时视为空消息列表
    return []
  }
}

/** 发送首条消息前预创建会话元数据，避免加载消息 404 */
export async function ensureConversationOnServer({ conversationId, chatMode, message, fallbackTitle }) {
  const mode = toApiMode(chatMode)
  const title = deriveConversationTitle(message, fallbackTitle)
  await upsertConversation({
    conversationId,
    title,
    preview: message || '',
    mode,
  })
}

export async function persistAgentTurn({
  conversationId,
  chatMode,
  message,
  fallbackTitle,
  userMessageId,
  assistantMessageId,
  assistantText,
  meta,
}) {
  const mode = toApiMode(chatMode)
  const title = deriveConversationTitle(message, fallbackTitle)

  await upsertConversation({
    conversationId,
    title,
    preview: message,
    mode,
  })
  await appendConversationMessage(conversationId, {
    role: 'user',
    kind: 'text',
    text: message,
    clientMessageId: userMessageId,
  })
  await appendConversationMessage(conversationId, {
    role: 'assistant',
    kind: 'text',
    text: assistantText,
    clientMessageId: assistantMessageId,
    metadata: meta || undefined,
  })
}

export async function renameConversationHistory(conversationId, title) {
  return renameConversation(conversationId, title)
}

export async function removeConversationHistory(conversationId) {
  return deleteConversationApi(conversationId)
}

export function truncateTitle(text, maxLength = 24) {
  const value = String(text || '').trim().replace(/\s+/g, ' ')

  if (!value) {
    return ''
  }

  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}...`
}

export function deriveConversationTitle(text, fallback = 'New Chat') {
  const normalized = String(text || '').trim().replace(/\s+/g, ' ')

  if (!normalized) {
    return fallback
  }

  const firstSentence = normalized.split(/[。！？?!\n]/).find(Boolean)?.trim() || normalized
  return truncateTitle(firstSentence, 24) || fallback
}
