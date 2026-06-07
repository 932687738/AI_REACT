export interface PlatformAgentRegistryItem {
  name: string;
  displayName: string;
  status: string;
  version: string;
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

export interface AgentHealthResponse {
  name: string;
  status: string;
  checkedAt: string;
}
