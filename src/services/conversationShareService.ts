import { API_PATHS } from '@/constants/ApiPaths';
import { request } from '@/openapi/request';

export interface CreateSharePayload {
  groupIds: string[];
}

export interface CreateShareResult {
  shareId: string;
  url: string;
  groupCount: number;
}

export interface ShareMessage {
  role: string;
  text: string;
  kind?: string;
  meta?: Record<string, unknown>;
}

export interface ShareGroup {
  groupIndex: number;
  messages: ShareMessage[];
}

export interface ShareDetail {
  shareId: string;
  title: string;
  chatMode: string;
  createdAt: number;
  groups: ShareGroup[];
}

export function createConversationShare(conversationId: string, payload: CreateSharePayload) {
  return request<CreateShareResult>(
    `${API_PATHS.agentHub.conversations}/${encodeURIComponent(conversationId)}/shares`,
    {
      method: 'POST',
      data: payload,
    },
  );
}

export function loadConversationShare(shareId: string) {
  return request<ShareDetail>(`${API_PATHS.agentHub.shares}/${encodeURIComponent(shareId)}`, {
    method: 'GET',
  });
}
