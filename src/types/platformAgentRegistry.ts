export type AgentAppVariableType = 'STRING' | 'NUMBER' | 'BOOLEAN';

export interface AgentAppVariable {
  name: string;
  type: AgentAppVariableType;
  defaultValue?: string;
  description?: string;
  required: boolean;
}

export interface PlatformAgentRegistryItem {
  name: string;
  displayName: string;
  status: string;
  version: string;
  flowId?: number | null;
  variables?: AgentAppVariable[];
}

export interface PlatformAgentRegistryListResponse {
  items: PlatformAgentRegistryItem[];
}

export interface RegisterPlatformAgentInput {
  name: string;
  displayName: string;
  capabilityDescription: string;
  beanName: string;
  healthCheckUrl?: string;
  permissionTags?: string[];
}

export interface UpdateAgentVariablesInput {
  variables: AgentAppVariable[];
}

export interface AgentHealthResponse {
  name: string;
  status: string;
  checkedAt: string;
}

/** POST /api/super-agents/chat/prep 响应 */
export interface SuperAgentChatPrepPreview {
  streamRoute: string;
  subAgentName?: string | null;
  displayName?: string | null;
  flowId?: number | null;
  variables?: AgentAppVariable[];
  multiAgentChain?: string[];
  stickyFollowUp?: boolean;
}

export interface AgentFlowBinding {
  agentName: string;
  flowId?: number | null;
  flowName?: string | null;
  flowStatus?: string | null;
}

export const AGENT_VARIABLE_MAX_VALUE_LENGTH = 1024;

export const AGENT_VARIABLE_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;
