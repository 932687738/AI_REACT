import type { KnowledgeChatMeta } from '@/openapi/typings';
import type { SuperAgentArtifactEvent, SuperAgentMetaEvent, SuperAgentProgressEvent } from '@/utils/SuperAgentSse';

/** SSE 流式回调（非 OpenAPI DTO） */
export interface ChatStreamHandlers {
  headers?: Record<string, string>;
  includeInFullText?: (chunk: string) => boolean;
  onChunk?: (chunk: string) => void;
  onProgress?: (event: SuperAgentProgressEvent) => void;
  onArtifact?: (event: SuperAgentArtifactEvent) => void;
  onMeta?: (meta: KnowledgeChatMeta | SuperAgentMetaEvent) => void;
  onComplete?: (fullText: string) => void;
}

export interface ChatPayload {
  conversationId: string;
  sessionId?: string;
  message: string;
  knowledgeBaseIds?: string[];
  language?: string;
  mode?: string;
  sessionVariables?: Record<string, string>;
}
