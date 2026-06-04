import { API_PATHS } from '@/constants/ApiPaths';
import { request } from '@/openapi/request';
import type {
  ConversationMessage,
  ConversationSummary,
  ConversationUpsertRequest,
} from '@/openapi/typings';

function conversationPath(conversationId: string): string {
  return `${API_PATHS.agentHub.conversations}/${encodeURIComponent(conversationId)}`;
}

export interface ListConversationsParams {
  mode?: string;
  ownerId?: string;
  limit?: number;
}

export function listConversations(params: ListConversationsParams = {}) {
  const query: Record<string, string> = {};
  if (params.mode) {
    query.mode = params.mode;
  }
  if (params.ownerId) {
    query.ownerId = params.ownerId;
  }
  if (params.limit !== undefined) {
    query.limit = String(params.limit);
  }
  return request<ConversationSummary[]>(API_PATHS.agentHub.conversations, {
    method: 'GET',
    params: query,
  });
}

export function loadConversationMessages(conversationId: string) {
  return request<ConversationMessage[]>(`${conversationPath(conversationId)}/messages`, {
    method: 'GET',
  });
}

export function upsertConversation(payload: ConversationUpsertRequest) {
  return request<ConversationSummary>(API_PATHS.agentHub.conversations, {
    method: 'POST',
    data: payload,
  });
}

export function appendConversationMessage(
  conversationId: string,
  payload: Partial<ConversationMessage>,
) {
  return request<ConversationMessage>(`${conversationPath(conversationId)}/messages`, {
    method: 'POST',
    data: payload,
  });
}

export function renameConversation(conversationId: string, title: string) {
  return request<void>(conversationPath(conversationId), {
    method: 'PATCH',
    data: { title },
  });
}

export function deleteConversation(conversationId: string) {
  return request<void>(conversationPath(conversationId), {
    method: 'DELETE',
  });
}
