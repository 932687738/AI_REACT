import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import { platformHeaders } from '@/services/platformAdminCommon';
import type {
  PlatformUncoveredIntentItem,
  PlatformUncoveredIntentListResponse,
} from '@/types/platformUncoveredIntent';

export function clampUncoveredIntentLimit(raw: number): number {
  if (!Number.isFinite(raw)) {
    return 20;
  }
  return Math.min(100, Math.max(1, Math.floor(raw)));
}

export async function listUncoveredIntents(
  limit: number,
): Promise<PlatformUncoveredIntentItem[]> {
  const safeLimit = clampUncoveredIntentLimit(limit);
  const res = await request<PlatformUncoveredIntentListResponse>(
    `${API_PATHS.superAgents.uncoveredIntents}?limit=${safeLimit}`,
    {
      method: 'GET',
      headers: platformHeaders(),
    },
  );
  return res?.items ?? [];
}
