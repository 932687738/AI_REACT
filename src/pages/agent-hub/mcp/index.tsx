import AgentHubMcpScreen from '@/components/agentHub/AgentHubMcpScreen';
import { useAgentHubStatus } from '@/hooks/useAgentHubStatus';

export default function AgentHubMcpPage() {
  const { data, isLoading, isError, refetch } = useAgentHubStatus();

  return (
    <AgentHubMcpScreen
      providers={data?.mcpProviders ?? []}
      callbacks={data?.mcpCallbacks ?? []}
      loading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
    />
  );
}
