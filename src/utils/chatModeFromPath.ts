import { CHAT_MODE, DEFAULT_CHAT_MODE, type ChatMode } from '@/constants/chatMode';
import { ROUTES } from '@/constants/routes';

/** 从 Umi 路由推导 chatMode，供历史会话过滤（design §4.5） */
export function chatModeFromPath(pathname: string): ChatMode {
  if (pathname.startsWith(ROUTES.CHAT_AGENT)) {
    return CHAT_MODE.AGENT;
  }
  if (pathname.startsWith(ROUTES.CHAT_REQUIREMENT_DEV)) {
    return CHAT_MODE.REQUIREMENT_DEV;
  }
  if (pathname.startsWith(ROUTES.CHAT_KNOWLEDGE)) {
    return CHAT_MODE.KNOWLEDGE;
  }
  return DEFAULT_CHAT_MODE;
}
