import { CHAT_MODE, type ChatMode } from '@/constants/chatMode';

export function resolveQuickActionIds(chatMode: ChatMode): string[] {
  if (chatMode === CHAT_MODE.REQUIREMENT_DEV) {
    return [
      'chat.quick.pmLogin',
      'chat.quick.pmOrder',
      'chat.quick.pmDashboard',
      'chat.quick.more',
    ];
  }
  return [
    'chat.quick.fast',
    'chat.quick.code',
    'chat.quick.write',
    'chat.quick.music',
    'chat.quick.more',
  ];
}
