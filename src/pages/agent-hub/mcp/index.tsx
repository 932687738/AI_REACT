import AgentHubMcpScreen from '@/components/agentHub/AgentHubMcpScreen';
import PlatformMcpOpsBar from '@/components/agentHub/PlatformMcpOpsBar';
import { useAgentHubStatus } from '@/hooks/useAgentHubStatus';

export default function AgentHubMcpPage() {
  const { data, isLoading, isError, refetch } = useAgentHubStatus();

  return (
    <>
      <PlatformMcpOpsBar onRefreshComplete={() => void refetch()} />
      <AgentHubMcpScreen
        providers={data?.mcpProviders ?? []}
        callbacks={data?.mcpCallbacks ?? []}
        loading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
      />
    </>
  );
}
