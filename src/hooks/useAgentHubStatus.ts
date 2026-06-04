import { useQuery } from '@tanstack/react-query';
import { getLocale } from '@umijs/max';
import { CHAT_MODE } from '@/constants/chatMode';
import { getAgentHubStatus } from '@/services/agentHubService';
import { resolveAgentHubApiLocale } from '@/utils/agentHubLocale';

export function useAgentHubStatus() {
  const apiLocale = resolveAgentHubApiLocale(getLocale());

  return useQuery({
    queryKey: ['agentHubStatus', apiLocale, CHAT_MODE.AGENT],
    queryFn: () => getAgentHubStatus(apiLocale, CHAT_MODE.AGENT),
    staleTime: 60_000,
  });
}
