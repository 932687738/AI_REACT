import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import { platformHeaders, platformWriteRequestOptions } from '@/services/platformAdminCommon';
import type {
  PlatformModelProviderListResponse,
  PlatformModelProviderRefreshResponse,
  PlatformModelProviderState,
} from '@/types/platformModelProvider';

export async function listModelProviders(): Promise<PlatformModelProviderState[]> {
  const res = await request<PlatformModelProviderListResponse>(
    API_PATHS.superAgents.modelProviders,
    {
      method: 'GET',
      headers: platformHeaders(),
    },
  );
  return res?.providers ?? [];
}

export async function setModelProviderEnabled(
  providerId: string,
  enabled: boolean,
): Promise<PlatformModelProviderState[]> {
  const res = await request<PlatformModelProviderListResponse>(
    API_PATHS.superAgents.modelProvider(providerId),
    {
      method: 'PATCH',
      headers: platformHeaders(),
      data: { enabled },
      ...platformWriteRequestOptions,
    },
  );
  return res?.providers ?? [];
}

export async function refreshModelProviders(): Promise<PlatformModelProviderRefreshResponse> {
  return request<PlatformModelProviderRefreshResponse>(
    API_PATHS.superAgents.modelProvidersRefresh,
    {
      method: 'POST',
      headers: platformHeaders(),
      ...platformWriteRequestOptions,
    },
  );
}
