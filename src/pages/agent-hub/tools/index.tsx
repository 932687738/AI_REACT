import AgentHubListScreen from '@/components/agentHub/AgentHubListScreen';
import { useAgentHubStatus } from '@/hooks/useAgentHubStatus';

export default function AgentHubToolsPage() {
  const { data, isLoading, isError, refetch } = useAgentHubStatus();

  return (
    <AgentHubListScreen
      titleId="agentHub.tools.title"
      subtitleId="agentHub.tools.subtitle"
      emptyId="agentHub.tools.empty"
      items={data?.tools ?? []}
      loading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      typeLabel="tool"
    />
  );
}
