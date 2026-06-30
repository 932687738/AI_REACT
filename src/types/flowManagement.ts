export type FlowStatus = 'draft' | 'published' | 'disabled';

export interface FlowNodePosition {
  x: number;
  y: number;
}

export interface FlowNodeRetryConfig {
  maxAttempts?: number;
  backoffMs?: number;
}

export interface FlowNodeData {
  retry?: FlowNodeRetryConfig;
  systemPrompt?: string;
  userPromptTemplate?: string;
  queryTemplate?: string;
  knowledgeBaseId?: number;
  messageTemplate?: string;
  categories?: string;
  inputTemplate?: string;
  expression?: string;
  script?: string;
  timeoutSeconds?: number;
  url?: string;
  method?: string;
  bodyTemplate?: string;
  subflowId?: number;
  [key: string]: unknown;
}

export interface FlowNodeDto {
  id: string;
  type: string;
  position?: FlowNodePosition;
  data?: FlowNodeData;
}

export interface FlowEdgeDto {
  source: string;
  target: string;
}

export interface FlowDefinitionDto {
  schemaVersion: number;
  nodes: FlowNodeDto[];
  edges: FlowEdgeDto[];
}

export interface FlowSummary {
  id: number;
  name: string;
  status: FlowStatus;
  currentVersion: number;
  enabled: boolean;
  description?: string | null;
}

export interface FlowDetail extends FlowSummary {
  definition: FlowDefinitionDto;
  updatedAt?: string;
}

export interface FlowListResponse {
  items: FlowSummary[];
  page: number;
  size: number;
  total: number;
}

export interface CreateFlowInput {
  name: string;
  description?: string;
}

export interface UpdateFlowInput {
  definition: FlowDefinitionDto;
  expectedUpdatedAt?: string;
}

export interface FlowPublishResult {
  flowId: number;
  versionNo: number;
  publishedAt: string;
}

export interface FlowVersionItem {
  id: number;
  flowId: number;
  versionNo: number;
  publishedBy?: string | null;
  publishedAt: string;
  remark?: string | null;
}

export interface RollbackFlowInput {
  versionNo: number;
}
