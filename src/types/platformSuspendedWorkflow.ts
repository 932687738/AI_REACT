export type WorkflowSuspendStatus = 'SUSPENDED' | 'RESUMED' | 'CLOSED';

export interface WorkflowSuspendItem {
  resumeToken: string;
  resumeTokenMasked: string;
  sessionId: string;
  tenantId: string;
  skillName?: string | null;
  status: WorkflowSuspendStatus | string;
  createdAt: string;
  resumedAt?: string | null;
  closedAt?: string | null;
  pendingMessagePreview?: string | null;
}

export interface WorkflowSuspendListResponse {
  items: WorkflowSuspendItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface WorkflowSuspendGraphStateSummary {
  hasWorkflowResumeToken: boolean;
}

export interface WorkflowSuspendDetail {
  resumeToken: string;
  sessionId: string;
  tenantId: string;
  skillName?: string | null;
  status: WorkflowSuspendStatus | string;
  createdAt: string;
  resumedAt?: string | null;
  closedAt?: string | null;
  pendingMessage?: string | null;
  graphStateSummary: WorkflowSuspendGraphStateSummary;
}

export interface WorkflowSuspendListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  skillName?: string;
}
