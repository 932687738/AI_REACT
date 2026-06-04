import { API_PATHS } from '@/constants/ApiPaths';
import { request } from '@/openapi/request';
import type { KnowledgeRetrievalThreshold } from '@/openapi/typings';

export function getKnowledgeRetrievalThreshold() {
  return request<KnowledgeRetrievalThreshold>(
    API_PATHS.agentHub.conversationConfigKnowledgeRetrievalThreshold,
    { method: 'GET' },
  );
}

export function saveKnowledgeRetrievalThreshold(payload: KnowledgeRetrievalThreshold) {
  return request<KnowledgeRetrievalThreshold>(
    API_PATHS.agentHub.conversationConfigKnowledgeRetrievalThreshold,
    {
      method: 'PUT',
      data: payload,
    },
  );
}
