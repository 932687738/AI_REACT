import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import { platformHeaders, platformWriteRequestOptions } from '@/services/platformAdminCommon';
import { postStream } from '@/utils/StreamSse';
import type {
  WorkflowSuspendDetail,
  WorkflowSuspendListQuery,
  WorkflowSuspendListResponse,
} from '@/types/platformSuspendedWorkflow';

export async function listSuspendedWorkflows(
  query: WorkflowSuspendListQuery = {},
): Promise<WorkflowSuspendListResponse> {
  return request<WorkflowSuspendListResponse>(API_PATHS.superAgents.suspendedWorkflows, {
    method: 'GET',
    headers: platformHeaders(),
    params: {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      keyword: query.keyword || undefined,
      status: query.status || undefined,
      skillName: query.skillName || undefined,
    },
  });
}

export async function getSuspendedWorkflowDetail(resumeToken: string): Promise<WorkflowSuspendDetail> {
  return request<WorkflowSuspendDetail>(API_PATHS.superAgents.suspendedWorkflow(resumeToken), {
    method: 'GET',
    headers: platformHeaders(),
  });
}

export async function closeSuspendedWorkflow(resumeToken: string): Promise<void> {
  await request<void>(API_PATHS.superAgents.suspendedWorkflowClose(resumeToken), {
    method: 'POST',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}

export async function deleteSuspendedWorkflow(resumeToken: string): Promise<void> {
  await request<void>(API_PATHS.superAgents.suspendedWorkflow(resumeToken), {
    method: 'DELETE',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}

export async function resumeSuspendedWorkflow(
  resumeToken: string,
  handlers: {
    onChunk?: (text: string) => void;
    onProgress?: (event: { step: string; status: string }) => void;
    onComplete?: (fullText: string) => void;
  } = {},
): Promise<string> {
  return postStream(
    API_PATHS.superAgents.hooksResume,
    { resumeToken },
    {
      headers: platformHeaders(),
      onChunk: handlers.onChunk,
      onProgress: handlers.onProgress,
      onComplete: handlers.onComplete,
    },
  );
}
