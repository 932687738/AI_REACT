import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import type {
  PlatformSkill,
  PlatformSkillListResponse,
  PlatformSkillStatusTarget,
  PublishPlatformSkillInput,
} from '@/types/platformSkill';

const ADMIN_KEY_STORAGE = 'aether.platform.adminApiKey';
const TENANT_STORAGE = 'aether.platform.tenantId';

export function getStoredAdminApiKey(): string {
  if (typeof sessionStorage === 'undefined') {
    return '';
  }
  return sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '';
}

export function setStoredAdminApiKey(value: string) {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, value.trim());
}

export function getStoredTenantId(): string {
  if (typeof sessionStorage === 'undefined') {
    return 'default';
  }
  return sessionStorage.getItem(TENANT_STORAGE) ?? 'default';
}

export function setStoredTenantId(value: string) {
  sessionStorage.setItem(TENANT_STORAGE, value.trim() || 'default');
}

function platformHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Tenant-Id': getStoredTenantId(),
  };
  const apiKey = getStoredAdminApiKey();
  if (apiKey) {
    headers['X-Admin-Api-Key'] = apiKey;
  }
  return headers;
}

export async function listPlatformSkills(): Promise<PlatformSkill[]> {
  const res = await request<PlatformSkillListResponse>(API_PATHS.superAgents.skills, {
    method: 'GET',
    headers: platformHeaders(),
  });
  return res?.items ?? [];
}

export async function publishPlatformSkill(
  input: PublishPlatformSkillInput,
): Promise<PlatformSkill> {
  return request<PlatformSkill>(API_PATHS.superAgents.skills, {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
  });
}

export async function transitionPlatformSkillStatus(
  name: string,
  version: number,
  targetStatus: PlatformSkillStatusTarget,
): Promise<void> {
  await request<void>(API_PATHS.superAgents.skillStatus(name, version), {
    method: 'PATCH',
    headers: platformHeaders(),
    data: { targetStatus },
  });
}
