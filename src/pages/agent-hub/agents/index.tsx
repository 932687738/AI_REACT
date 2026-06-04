import AgentHubListScreen from '@/components/agentHub/AgentHubListScreen';
import { useAgentHubStatus } from '@/hooks/useAgentHubStatus';

export default function AgentHubAgentsPage() {
  const { data, isLoading, isError, refetch } = useAgentHubStatus();

  return (
    <AgentHubListScreen
      titleId="agentHub.agents.title"
      subtitleId="agentHub.agents.subtitle"
      emptyId="agentHub.agents.empty"
      items={data?.subAgents ?? []}
      loading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      typeLabel="agent"
    />
  );
}
