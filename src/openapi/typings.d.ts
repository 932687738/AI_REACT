/**
 * OpenAPI 类型真源（对齐 openapi-spec/agent-hub.openapi.yaml；springdoc 就绪后可重新生成覆盖）。
 * 业务代码仅 import 本文件，禁止手写重复 DTO。
 */

export interface KnowledgeChatRequest {
  conversationId: string;
  sessionId?: string;
  message: string;
  knowledgeBaseIds?: string[];
}

export interface AgentChatRequest {
  conversationId: string;
  message: string;
}

export interface RequirementDevChatRequest {
  conversationId: string;
  requirement: string;
}

export interface KnowledgeBaseInput {
  name?: string;
  description?: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  documentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeDocument {
  id: string;
  fileName?: string;
  name?: string;
  status?: string;
  chunkCount?: number;
  updatedAt?: string;
}

export interface UploadDocumentResponse {
  documentId?: string | null;
  document_id?: string | null;
  language?: string;
  chunkCount?: number;
  chunk_count?: number;
  alreadyExists?: boolean;
  already_exists?: boolean;
  message?: string;
  chunksPreview?: unknown[];
  chunks_preview?: unknown[];
}

export interface BatchDeleteDocumentsRequest {
  knowledgeBaseId: string;
  documentIds: string[];
}

export interface BatchDeleteDocumentsResponse {
  successCount?: number;
  failureCount?: number;
  deletedCount?: number;
  message?: string;
  failedDocumentIds?: string[];
  results?: Array<{ documentId: string; success: boolean; errorMessage?: string }>;
}

export interface ConversationSummary {
  id: string;
  title?: string;
  preview?: string;
  mode?: string;
  updatedAt?: number;
  pinned?: boolean;
  pinnedAt?: number | null;
}

export interface ConversationSearchHit {
  conversationId: string;
  messageId?: string | null;
  title?: string;
  chatMode?: string;
  role?: string | null;
  matchField?: 'title' | 'content' | string;
  snippet?: string;
  hitAt?: number;
}

export interface ConversationSearchPage {
  items: ConversationSearchHit[];
  page: number;
  size: number;
  totalHits: number;
  hasMore: boolean;
}

export interface ConversationUpsertRequest {
  conversationId: string;
  title?: string;
  mode?: string;
  preview?: string;
  ownerId?: string;
}

export interface AgentProgressStep {
  step: string;
  status: string;
  thought?: string;
  toolName?: string;
  toolResultSummary?: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | string;
  kind?: string;
  text: string;
  pending?: boolean;
  error?: boolean;
  meta?: KnowledgeChatMeta;
  /** 客户端 SSE：SuperAgents structured progress（非 OpenAPI 字段） */
  agentProgress?: AgentProgressStep[];
}

export interface KnowledgeCitation {
  chunkId?: string;
  documentId?: string;
  knowledgeBaseId?: string;
  knowledgeBaseName?: string;
  documentName?: string;
  preview?: string;
  vectorScore?: number | null;
  score?: number;
  rerankScore?: number;
}

export interface KnowledgeChatMeta {
  event?: 'meta';
  sessionId?: string;
  knowledgeBaseNames?: string[];
  knowledgeBaseCount?: number;
  citations?: KnowledgeCitation[];
}

export interface KnowledgeRetrievalThreshold {
  minRelevancePercent?: number;
  minVectorSimilarityPercent?: number;
  scoreThreshold?: number;
  enabled?: boolean;
}

export interface AgentHubStatusResponse {
  locale?: string;
  modules?: unknown[];
  skills?: unknown[];
  subAgents?: unknown[];
  tools?: unknown[];
  mcpCallbacks?: unknown[];
  mcpProviders?: unknown[];
}

export type JsonMap = Record<string, unknown>;
