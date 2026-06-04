import AgentHubListScreen from '@/components/agentHub/AgentHubListScreen';
import { useAgentHubStatus } from '@/hooks/useAgentHubStatus';

export default function AgentHubMcpPage() {
  const { data, isLoading, isError, refetch } = useAgentHubStatus();

  return (
    <AgentHubListScreen
      titleId="agentHub.mcp.title"
      subtitleId="agentHub.mcp.subtitle"
      emptyId="agentHub.mcp.empty"
      items={data?.mcpCallbacks ?? []}
      loading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      typeLabel="mcp"
    />
  );
}
