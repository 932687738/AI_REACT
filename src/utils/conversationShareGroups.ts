import type { ConversationMessage } from '@/openapi/typings';

export interface ConversationShareGroup {
  id: string;
  messageIds: string[];
  preview: string;
}

/** 将消息切分为可分享的对话组（user + 连续 assistant） */
export function buildConversationGroups(messages: ConversationMessage[]): ConversationShareGroup[] {
  const groups: ConversationShareGroup[] = [];
  let current: ConversationShareGroup | null = null;

  for (const message of messages) {
    if (!message?.id || message.pending) {
      continue;
    }
    if (message.role === 'user') {
      current = {
        id: message.id,
        messageIds: [message.id],
        preview: String(message.text || '').trim(),
      };
      groups.push(current);
      continue;
    }
    if (current) {
      current.messageIds.push(message.id);
      continue;
    }
    groups.push({
      id: message.id,
      messageIds: [message.id],
      preview: '',
    });
  }

  return groups;
}
