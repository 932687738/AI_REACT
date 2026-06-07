import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import { platformHeaders, platformWriteRequestOptions } from '@/services/platformAdminCommon';
import type {
  AgentHealthResponse,
  PlatformAgentRegistryItem,
  PlatformAgentRegistryListResponse,
  RegisterPlatformAgentInput,
} from '@/types/platformAgentRegistry';

export async function listPlatformAgents(): Promise<PlatformAgentRegistryItem[]> {
  const res = await request<PlatformAgentRegistryListResponse>(API_PATHS.superAgents.agents, {
    method: 'GET',
    headers: platformHeaders(),
  });
  return res?.items ?? [];
}

export async function registerPlatformAgent(
  input: RegisterPlatformAgentInput,
): Promise<PlatformAgentRegistryItem> {
  return request<PlatformAgentRegistryItem>(API_PATHS.superAgents.agents, {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function probePlatformAgentHealth(name: string): Promise<AgentHealthResponse> {
  return request<AgentHealthResponse>(API_PATHS.superAgents.agentHealth(name), {
    method: 'POST',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}
