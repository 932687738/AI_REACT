import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import { platformHeaders, platformWriteRequestOptions } from '@/services/platformAdminCommon';
import type {
  AgentHealthResponse,
  PlatformAgentRegistryItem,
  PlatformAgentRegistryListResponse,
  RegisterPlatformAgentInput,
  SuperAgentChatPrepPreview,
  UpdateAgentVariablesInput,
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

export async function updateAgentVariables(
  name: string,
  input: UpdateAgentVariablesInput,
): Promise<PlatformAgentRegistryItem> {
  return request<PlatformAgentRegistryItem>(API_PATHS.superAgents.agentVariables(name), {
    method: 'PUT',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

/** 同步 prep 路由预览：返回预计子 Agent 与应用变量定义。 */
export async function previewSuperAgentChatRoute(params: {
  conversationId: string;
  message: string;
}): Promise<SuperAgentChatPrepPreview> {
  return request<SuperAgentChatPrepPreview>(API_PATHS.superAgents.chatPrep, {
    method: 'POST',
    headers: platformHeaders(),
    data: {
      conversationId: params.conversationId,
      message: params.message,
      sessionVariables: {},
    },
  });
}
