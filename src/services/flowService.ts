import { request } from '@/openapi/request';
import { postStream } from '@/utils/StreamSse';
import { API_PATHS } from '@/constants/ApiPaths';
import {
  platformHeaders,
  platformWriteRequestOptions,
} from '@/services/platformAdminCommon';
import type {
  CreateFlowInput,
  FlowDetail,
  FlowListResponse,
  FlowPublishResult,
  FlowVersionItem,
  RollbackFlowInput,
  UpdateFlowInput,
} from '@/types/flowManagement';
import type {
  FlowExecutionDetail,
  FlowExecutionListResponse,
  ListFlowExecutionsParams,
} from '@/types/flowExecution';

export interface ListFlowsParams {
  page?: number;
  size?: number;
  status?: string;
  name?: string;
}

export async function listFlows(params: ListFlowsParams = {}): Promise<FlowListResponse> {
  return request<FlowListResponse>(API_PATHS.agentHub.flows, {
    method: 'GET',
    headers: platformHeaders(),
    params,
  });
}

export async function getFlow(flowId: number): Promise<FlowDetail> {
  return request<FlowDetail>(API_PATHS.agentHub.flow(flowId), {
    method: 'GET',
    headers: platformHeaders(),
  });
}

export async function createFlow(input: CreateFlowInput): Promise<FlowDetail> {
  return request<FlowDetail>(API_PATHS.agentHub.flows, {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function updateFlow(flowId: number, input: UpdateFlowInput): Promise<FlowDetail> {
  return request<FlowDetail>(API_PATHS.agentHub.flow(flowId), {
    method: 'PUT',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function deleteFlow(flowId: number): Promise<void> {
  await request<void>(API_PATHS.agentHub.flow(flowId), {
    method: 'DELETE',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}

export async function publishFlow(flowId: number): Promise<FlowPublishResult> {
  return request<FlowPublishResult>(API_PATHS.agentHub.flowPublish(flowId), {
    method: 'POST',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}

export async function disableFlow(flowId: number): Promise<FlowDetail> {
  return request<FlowDetail>(API_PATHS.agentHub.flowDisable(flowId), {
    method: 'POST',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}

export async function enableFlow(flowId: number): Promise<FlowDetail> {
  return request<FlowDetail>(API_PATHS.agentHub.flowEnable(flowId), {
    method: 'POST',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}

export async function listFlowVersions(flowId: number): Promise<FlowVersionItem[]> {
  return request<FlowVersionItem[]>(API_PATHS.agentHub.flowVersions(flowId), {
    method: 'GET',
    headers: platformHeaders(),
  });
}

export async function rollbackFlow(
  flowId: number,
  input: RollbackFlowInput,
): Promise<FlowPublishResult> {
  return request<FlowPublishResult>(API_PATHS.agentHub.flowRollback(flowId), {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export interface FlowRegisterMcpToolResult {
  flowId: number;
  mcpToolName: string;
}

export async function registerFlowMcpTool(flowId: number): Promise<FlowRegisterMcpToolResult> {
  return request<FlowRegisterMcpToolResult>(API_PATHS.agentHub.flowRegisterMcp(flowId), {
    method: 'POST',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}

export async function debugFlowStream(
  flowId: number,
  params: Record<string, unknown>,
  onEvent: (payload: string) => void,
): Promise<void> {
  await postStream(
    API_PATHS.agentHub.flowDebug(flowId),
    { params },
    {
      headers: platformHeaders(),
      onChunk: onEvent,
      includeInFullText: () => false,
    },
  );
}

export async function listFlowExecutions(
  params: ListFlowExecutionsParams = {},
): Promise<FlowExecutionListResponse> {
  return request<FlowExecutionListResponse>(API_PATHS.agentHub.flowExecutions, {
    method: 'GET',
    headers: platformHeaders(),
    params,
  });
}

export async function getFlowExecution(executionId: number): Promise<FlowExecutionDetail> {
  return request<FlowExecutionDetail>(API_PATHS.agentHub.flowExecution(executionId), {
    method: 'GET',
    headers: platformHeaders(),
  });
}
