import type { ConversationMessage } from '@/openapi/typings';

const USER_SNIPPET_MAX = 40;

function truncateSnippet(text: string, max = USER_SNIPPET_MAX): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max - 1)}…`;
}

export interface ChatUserMessageNavItem {
  id: string;
  label: string;
}

/** 当前会话中用户发送的消息，供右侧导航轨定位滚动 */
export function buildUserMessageNavItems(messages: ConversationMessage[]): ChatUserMessageNavItem[] {
  return messages
    .filter((item) => item.role === 'user' && item.text?.trim())
    .map((item) => ({
      id: item.id,
      label: truncateSnippet(item.text),
    }));
}
