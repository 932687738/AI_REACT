import ChatShell from '@/components/chat/ChatShell';
import { CHAT_MODE } from '@/constants/chatMode';

export default function AgentChatPage() {
  return <ChatShell chatMode={CHAT_MODE.AGENT} />;
}
