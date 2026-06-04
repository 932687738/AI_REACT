/** SuperAgents 平台 Skill（与后端 SkillItemResponse 对齐） */
export type PlatformSkillStatus = 'active' | 'deprecated' | 'observed' | 'deleted';

export interface PlatformSkillStep {
  order: number;
  instruction: string;
  tool?: string;
}

export interface PlatformSkill {
  name: string;
  version: number;
  status: PlatformSkillStatus;
  description: string;
  toolWhitelist: string[];
}

export interface PlatformSkillListResponse {
  items: PlatformSkill[];
}

export interface PublishPlatformSkillInput {
  name: string;
  description: string;
  steps: PlatformSkillStep[];
  toolWhitelist: string[];
  createdBy?: string;
}

export type PlatformSkillStatusTarget = 'ACTIVE' | 'DEPRECATED' | 'OBSERVED' | 'DELETED';

export const SKILL_STATUS_TRANSITIONS: Record<
  PlatformSkillStatus,
  PlatformSkillStatusTarget[]
> = {
  active: ['DEPRECATED'],
  deprecated: ['OBSERVED', 'DELETED'],
  observed: ['DELETED', 'ACTIVE'],
  deleted: [],
};
