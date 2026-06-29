import type { PromptTemplate } from '@/types/promptMarketplace';

export type { PromptTemplate };

export interface PromptTemplatePageResponse {
  items: PromptTemplate[];
  total: number;
}

export interface SavePromptTemplateRequest {
  name: string;
  description?: string;
  category: string;
  content: string;
  tags?: string[];
}

export interface RollbackPromptRequest {
  version: number;
}

export interface PromptExperimentVariant {
  templateName: string;
  version: number;
  weightPercent: number;
}

export interface PromptExperimentResponse {
  sceneKey: string;
  variants: PromptExperimentVariant[];
}

export interface SavePromptExperimentRequest {
  variants: PromptExperimentVariant[];
}

export interface PromptInvokeLog {
  id: number;
  templateName: string;
  version: number;
  sceneKey: string | null;
  invokeType: string;
  inputSummary: string | null;
  outputSummary: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  durationMs: number | null;
  createdAt: string;
}

export interface PromptInvokeLogListResponse {
  items: PromptInvokeLog[];
  total: number;
}
