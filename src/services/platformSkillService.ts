import {
  getStoredAdminApiKey,
  getStoredTenantId,
  platformHeaders,
  platformWriteRequestOptions,
  setStoredAdminApiKey,
  setStoredTenantId,
} from '@/services/platformAdminCommon';

export {
  getStoredAdminApiKey,
  getStoredTenantId,
  platformHeaders,
  setStoredAdminApiKey,
  setStoredTenantId,
};

export type {
  PlatformSkill,
  PlatformSkillListResponse,
  PlatformSkillStatus,
  PlatformSkillStatusTarget,
  PlatformSkillStep,
  PublishPlatformSkillInput,
} from '@/types/platformSkill';
export { SKILL_STATUS_TRANSITIONS } from '@/types/platformSkill';

import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import type {
  PlatformSkill,
  PlatformSkillListResponse,
  PlatformSkillStatusTarget,
  PublishPlatformSkillInput,
} from '@/types/platformSkill';

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
    ...platformWriteRequestOptions,
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
    ...platformWriteRequestOptions,
  });
}
