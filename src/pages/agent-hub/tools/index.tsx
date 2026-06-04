import AgentHubListScreen from '@/components/agentHub/AgentHubListScreen';
import { useAgentHubStatus } from '@/hooks/useAgentHubStatus';
import type { AgentHubLocalTool } from '@/services/agentHubService';
import { useIntl } from '@umijs/max';

function formatToolChips(
  item: AgentHubLocalTool,
  moduleLabel: string,
  beanLabel: string,
): string[] {
  const chips: string[] = [];
  if (item.module) {
    chips.push(`${moduleLabel} · ${item.module}`);
  }
  if (item.beanClass) {
    chips.push(`${beanLabel} · ${item.beanClass}`);
  }
  return chips;
}

export default function AgentHubToolsPage() {
  const intl = useIntl();
  const { data, isLoading, isError, refetch } = useAgentHubStatus();
  const moduleLabel = intl.formatMessage({ id: 'agentHub.tools.module' });
  const beanLabel = intl.formatMessage({ id: 'agentHub.tools.bean' });

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
      formatChips={(item) =>
        formatToolChips(item as AgentHubLocalTool, moduleLabel, beanLabel)
      }
    />
  );
}
