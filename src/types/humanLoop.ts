import type { JsonMap } from '@/openapi/typings';

export interface HilStep1Response extends JsonMap {
  checkpointId?: string;
  modelReply?: string;
  status?: string;
}

export interface HilStep2Response extends JsonMap {
  finalReply?: string;
}

export interface ToolApprovalItem {
  toolCallId?: string;
  toolName?: string;
  approvalPrompt?: string;
  arguments?: string;
}

export interface ToolFeedbackInvokeResponse extends JsonMap {
  status?: string;
  assistantPreview?: string;
  pendingApprovals?: ToolApprovalItem[];
}

export interface ToolFeedbackResumeResponse extends JsonMap {
  assistantReply?: string;
  toolExecutionLogs?: string[];
}

export interface EnterpriseContractResponse extends JsonMap {
  status?: string;
  riskLevel?: string;
  riskDetails?: string;
  auditReport?: string;
  structuredText?: string;
  elapsedMillis?: number;
}

export interface EnterpriseCsResponse extends JsonMap {
  intent?: string;
  productKbHit?: string | boolean;
  policyKbHit?: string | boolean;
  finalReply?: string;
  elapsedMillis?: number;
}

export interface EnterprisePublishingStep1Response extends JsonMap {
  status?: string;
  checkpointId?: string;
  selectedTitle?: string;
  articleDraft?: string;
  suspectedWords?: string;
  publishLog?: string;
  nextStepHint?: string;
}

export interface EnterprisePublishingStep2Response extends JsonMap {
  publishStatus?: string;
  publishLog?: string;
}

export function toHumanLoopErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
