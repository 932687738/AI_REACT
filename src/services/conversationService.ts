import { API_PATHS } from '@/constants/ApiPaths';
import { request } from '@/openapi/request';
import type {
  ConversationMessage,
  ConversationSearchPage,
  ConversationSummary,
  ConversationUpsertRequest,
} from '@/openapi/typings';

function requireConversationId(conversationId: string): string {
  const id = String(conversationId ?? '').trim();
  if (!id || id === '""' || id === "''") {
    throw new Error('conversationId is required');
  }
  return id;
}

function conversationPath(conversationId: string): string {
  return `${API_PATHS.agentHub.conversations}/${encodeURIComponent(requireConversationId(conversationId))}`;
}

export interface ListConversationsParams {
  mode?: string;
  ownerId?: string;
  limit?: number;
}

export interface SearchConversationsParams {
  q: string;
  mode?: string;
  ownerId?: string;
  page?: number;
  size?: number;
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

export function searchConversations(params: SearchConversationsParams) {
  const query = String(params.q ?? '').trim();
  if (!query) {
    return Promise.reject(new Error('search query is required'));
  }
  const searchParams: Record<string, string> = { q: query };
  if (params.mode) {
    searchParams.mode = params.mode;
  }
  if (params.ownerId) {
    searchParams.ownerId = params.ownerId;
  }
  if (params.page !== undefined) {
    searchParams.page = String(params.page);
  }
  if (params.size !== undefined) {
    searchParams.size = String(params.size);
  }
  return request<ConversationSearchPage>(`${API_PATHS.agentHub.conversations}/search`, {
    method: 'GET',
    params: searchParams,
  });
}

export function loadConversationMessages(conversationId: string) {
  return request<ConversationMessage[]>(`${conversationPath(conversationId)}/messages`, {
    method: 'GET',
  });
}

export function checkConversationExists(conversationId: string) {
  return request<{ exists: boolean }>(`${conversationPath(conversationId)}/exists`, {
    method: 'GET',
  });
}

export function upsertConversation(payload: ConversationUpsertRequest) {
  return request<ConversationSummary>(API_PATHS.agentHub.conversations, {
    method: 'POST',
    data: {
      conversationId: requireConversationId(payload.conversationId),
      title: payload.title,
      preview: payload.preview,
      mode: payload.mode,
      ownerId: payload.ownerId,
    },
  });
}

export function appendConversationMessage(
  conversationId: string,
  payload: Partial<ConversationMessage>,
) {
  return request<ConversationMessage>(`${conversationPath(conversationId)}/messages`, {
    method: 'POST',
    data: {
      role: payload.role,
      kind: payload.kind,
      text: payload.text,
      clientMessageId: payload.id,
      metadata: payload.meta,
    },
  });
}

export interface PatchConversationPayload {
  title?: string;
  pinned?: boolean;
}

export function patchConversation(conversationId: string, payload: PatchConversationPayload) {
  return request<ConversationSummary>(conversationPath(conversationId), {
    method: 'PATCH',
    data: payload,
  });
}

export function renameConversation(conversationId: string, title: string) {
  return patchConversation(conversationId, { title });
}

export function deleteConversation(conversationId: string) {
  return request<void>(conversationPath(conversationId), {
    method: 'DELETE',
  });
}

