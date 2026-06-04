import {
  appendConversationMessage,
  loadConversationMessages,
  upsertConversation,
} from '@/services/conversationService';
import type { ChatMode } from '@/constants/chatMode';
import type { ConversationMessage, KnowledgeChatMeta } from '@/openapi/typings';
import {
  deriveConversationTitle,
  normalizeConversationMessage,
  toApiMode,
} from '@/utils/conversationHelpers';

export async function ensureConversationOnServer(params: {
  conversationId: string;
  chatMode: ChatMode;
  message: string;
  fallbackTitle: string;
}) {
  const { conversationId, chatMode, message, fallbackTitle } = params;
  await upsertConversation({
    conversationId,
    title: deriveConversationTitle(message, fallbackTitle),
    preview: message || '',
    mode: toApiMode(chatMode),
  });
}

export async function fetchNormalizedMessages(conversationId: string): Promise<ConversationMessage[]> {
  try {
    const messages = await loadConversationMessages(conversationId);
    return (Array.isArray(messages) ? messages : [])
      .map(normalizeConversationMessage)
      .filter((item): item is ConversationMessage => item !== null);
  } catch {
    return [];
  }
}

export async function persistAgentTurn(params: {
  conversationId: string;
  chatMode: ChatMode;
  message: string;
  fallbackTitle: string;
  userMessageId: string;
  assistantMessageId: string;
  assistantText: string;
  meta?: KnowledgeChatMeta;
}) {
  const {
    conversationId,
    chatMode,
    message,
    fallbackTitle,
    userMessageId,
    assistantMessageId,
    assistantText,
    meta,
  } = params;

  await upsertConversation({
    conversationId,
    title: deriveConversationTitle(message, fallbackTitle),
    preview: message,
    mode: toApiMode(chatMode),
  });
  await appendConversationMessage(conversationId, {
    id: userMessageId,
    role: 'user',
    kind: 'text',
    text: message,
  });
  await appendConversationMessage(conversationId, {
    id: assistantMessageId,
    role: 'assistant',
    kind: 'text',
    text: assistantText,
    meta,
  });
}
