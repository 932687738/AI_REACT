const STORAGE_KEY = 'nebula_desk_conversation_history_v1'
const MESSAGE_STORAGE_KEY = 'nebula_desk_conversation_messages_v1'

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
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

  return {
    ...item,
    id,
    title,
    preview,
    updatedAt: Number(item.updatedAt) || Date.now(),
  }
}

export function loadConversationHistory() {
  if (typeof window === 'undefined') {
    return []
  }

  // TODO: replace with backend query when conversation history API is ready.
  return safeParse(localStorage.getItem(STORAGE_KEY)).map(normalizeItem).filter(Boolean)
}

export function saveConversationHistory(items) {
  if (typeof window === 'undefined') {
    return items
  }

  // TODO: replace with backend persistence when conversation history API is ready.
  const normalizedItems = Array.isArray(items) ? items.map(normalizeItem).filter(Boolean) : []
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedItems))
  return normalizedItems
}

export function upsertConversationHistory(items, nextItem) {
  const normalizedNext = normalizeItem(nextItem)
  if (!normalizedNext) {
    return saveConversationHistory(items)
  }

  return saveConversationHistory([
    normalizedNext,
    ...items.filter((item) => item.id !== normalizedNext.id),
  ])
}

export function updateConversationHistory(items, id, patch) {
  const targetId = String(id || '').trim()
  if (!targetId) {
    return saveConversationHistory(items)
  }

  return saveConversationHistory(
    items.map((item) => (item.id === targetId ? normalizeItem({ ...item, ...patch }) || item : item)),
  )
}

export function deleteConversationHistory(items, id) {
  const targetId = String(id || '').trim()
  if (!targetId) {
    return saveConversationHistory(items)
  }

  return saveConversationHistory(items.filter((item) => item.id !== targetId))
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
  }
}

function loadMessageMap() {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveMessageMap(map) {
  if (typeof window === 'undefined') {
    return map
  }

  localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(map))
  return map
}

export function loadConversationMessages(conversationId) {
  if (typeof window === 'undefined') {
    return []
  }

  const id = String(conversationId || '').trim()
  if (!id) {
    return []
  }

  // TODO: replace with backend query when conversation message API is ready.
  const map = loadMessageMap()
  const messages = Array.isArray(map[id]) ? map[id] : []
  return messages.map(normalizeMessage).filter(Boolean)
}

export function saveConversationMessages(conversationId, messages) {
  if (typeof window === 'undefined') {
    return messages
  }

  const id = String(conversationId || '').trim()
  if (!id) {
    return messages
  }

  // TODO: replace with backend persistence when conversation message API is ready.
  const map = loadMessageMap()
  map[id] = Array.isArray(messages) ? messages.map(normalizeMessage).filter(Boolean) : []
  saveMessageMap(map)
  return map[id]
}

export function deleteConversationMessages(conversationId) {
  if (typeof window === 'undefined') {
    return
  }

  const id = String(conversationId || '').trim()
  if (!id) {
    return
  }

  const map = loadMessageMap()
  delete map[id]
  saveMessageMap(map)
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
