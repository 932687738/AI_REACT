import ChatShell from '@/components/chat/ChatShell';
import { CHAT_MODE } from '@/constants/chatMode';

export default function KnowledgeChatPage() {
  return <ChatShell chatMode={CHAT_MODE.KNOWLEDGE} />;
}
