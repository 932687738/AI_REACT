import { API_CHAT_MODE, CHAT_MODE, type ChatMode } from '@/constants/chatMode';
import type { ConversationSummary, ConversationMessage, KnowledgeChatMeta } from '@/openapi/typings';
import { normalizeCitation } from '@/utils/KnowledgeCitation';

export type NormalizedConversation = ConversationSummary & {
  id: string;
  title: string;
  preview: string;
  mode: ChatMode;
  updatedAt: number;
};

export function createConversationId(): string {
  const now = Date.now();
  if (createConversationId.lastNow === now) {
    createConversationId.sequence += 1;
  } else {
    createConversationId.lastNow = now;
    createConversationId.sequence = 0;
  }
  return createConversationId.sequence === 0 ? String(now) : `${now}-${createConversationId.sequence}`;
}
createConversationId.lastNow = 0;
createConversationId.sequence = 0;

export function toApiMode(chatMode: ChatMode): string {
  return API_CHAT_MODE[chatMode];
}

export function truncateTitle(text: string, maxLength = 24): string {
  const value = String(text || '')
    .trim()
    .replace(/\s+/g, ' ');
  if (!value) {
    return '';
  }
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}...`;
}

export function deriveConversationTitle(text: string, fallback = 'New Chat'): string {
  const normalized = String(text || '')
    .trim()
    .replace(/\s+/g, ' ');
  if (!normalized) {
    return fallback;
  }
  const firstSentence = normalized.split(/[。！？?!\n]/).find(Boolean)?.trim() || normalized;
  return truncateTitle(firstSentence, 24) || fallback;
}

function normalizeHistoryMeta(rawMeta: KnowledgeChatMeta | undefined) {
  if (!rawMeta) {
    return undefined;
  }
  const citations = Array.isArray(rawMeta.citations)
    ? rawMeta.citations.map(normalizeCitation).filter(Boolean)
    : [];
  if (citations.length === 0 && (rawMeta.knowledgeBaseCount === null || rawMeta.knowledgeBaseCount === undefined)) {
    return undefined;
  }
  return {
    knowledgeBaseCount: rawMeta.knowledgeBaseCount ?? 0,
    knowledgeBaseNames: Array.isArray(rawMeta.knowledgeBaseNames) ? rawMeta.knowledgeBaseNames : [],
    citations,
  };
}

export function normalizeConversationItem(
  item: ConversationSummary | null | undefined,
): NormalizedConversation | null {
  if (!item || typeof item !== 'object') {
    return null;
  }
  const id = String(item.id || '').trim();
  if (!id) {
    return null;
  }
  const preview = String(item.preview || '').trim();
  const title = String(item.title || preview || '').trim();
  let mode = item.mode;
  if (mode === 'requirement-dev') {
    mode = CHAT_MODE.REQUIREMENT_DEV;
  }
  return {
    ...item,
    id,
    title: title || '暂无聊天内容',
    preview,
    mode: (mode as ChatMode) || CHAT_MODE.KNOWLEDGE,
    updatedAt: Number(item.updatedAt) || Date.now(),
  };
}

export function normalizeConversationMessage(item: ConversationMessage | null | undefined) {
  if (!item || typeof item !== 'object') {
    return null;
  }
  const id = String(item.id || '').trim();
  if (!id) {
    return null;
  }
  const rawMeta = item.meta && typeof item.meta === 'object' ? item.meta : undefined;
  return {
    ...item,
    id,
    role: item.role === 'assistant' ? 'assistant' : 'user',
    kind: String(item.kind || 'text'),
    text: String(item.text || ''),
    pending: Boolean(item.pending),
    error: Boolean(item.error),
    meta: normalizeHistoryMeta(rawMeta),
  } as ConversationMessage;
}

export function resolveHistoryMode(item: ConversationSummary): ChatMode {
  if (item.mode === CHAT_MODE.AGENT || item.mode === 'agent') {
    return CHAT_MODE.AGENT;
  }
  if (item.mode === CHAT_MODE.REQUIREMENT_DEV || item.mode === 'requirement-dev') {
    return CHAT_MODE.REQUIREMENT_DEV;
  }
  return CHAT_MODE.KNOWLEDGE;
}
