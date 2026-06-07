import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import { platformHeaders, platformWriteRequestOptions } from '@/services/platformAdminCommon';

export interface PlatformMcpRefreshResult {
  externalToolsBefore: number;
  externalToolsAfter: number;
  mcpCallbacks: string[];
}

export async function refreshMcpTools(): Promise<PlatformMcpRefreshResult> {
  return request<PlatformMcpRefreshResult>(API_PATHS.superAgents.mcpRefresh, {
    method: 'POST',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}
