import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import { platformHeaders } from '@/services/platformAdminCommon';
import type {
  PlatformToolSummaryItem,
  PlatformToolSummaryResponse,
} from '@/types/platformToolCatalog';

export async function listPlatformToolSummaries(): Promise<PlatformToolSummaryItem[]> {
  const res = await request<PlatformToolSummaryResponse>(API_PATHS.superAgents.tools, {
    method: 'GET',
    headers: platformHeaders(),
  });
  return res?.tools ?? [];
}
