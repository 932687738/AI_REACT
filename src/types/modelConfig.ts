/**
 * AI 模型配置类型定义。
 */

export type ModelProvider = 'DEEPSEEK' | 'OPENAI' | 'DASHSCOPE' | 'OLLAMA' | 'CUSTOM';

export type ModelStatus = 'inactive' | 'active' | 'disabled';

export type ModelTaskType = 'INTENT_ROUTING' | 'AGENT_REASONING' | 'EMBEDDING';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  taskTypes: ModelTaskType[];
  params: Record<string, unknown>;
  status: ModelStatus;
  isDefault: boolean;
  testPassed: boolean;
  lastTestTime?: string;
  createdBy?: string;
  createTime?: string;
  updatedBy?: string;
  updateTime?: string;
}

export interface ModelConfigCreateRequest {
  name: string;
  provider: ModelProvider;
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  taskTypes: ModelTaskType[];
  params?: Record<string, unknown>;
}

export type ModelConfigUpdateRequest = ModelConfigCreateRequest;

export interface ModelTestResult {
  success: boolean;
  latencyMs: number;
  tokensUsed: number;
  errorMsg?: string;
}

export interface ProviderInfo {
  name: ModelProvider;
  displayName: string;
  defaultBaseUrl?: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  page: number;
  size: number;
}

export interface ApiResponse<T> {
  code: number;
  result?: T;
  message?: string;
}
