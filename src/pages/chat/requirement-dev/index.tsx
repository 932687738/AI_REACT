import ChatShell from '@/components/chat/ChatShell';
import { CHAT_MODE } from '@/constants/chatMode';

export default function RequirementDevChatPage() {
  return <ChatShell chatMode={CHAT_MODE.REQUIREMENT_DEV} />;
}
