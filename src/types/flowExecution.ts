export type FlowExecutionStatus = 'running' | 'success' | 'failed' | 'cancelled';
export type FlowTriggerType = 'api' | 'app' | 'mcp' | 'debug';

export interface FlowExecutionSummary {
  id: number;
  flowId: number;
  flowName: string;
  flowVersion: number;
  triggerType: FlowTriggerType;
  status: FlowExecutionStatus;
  durationMs: number | null;
  tokenUsage: Record<string, unknown>;
  traceId: string | null;
  createdAt: string;
}

export interface FlowExecutionListResponse {
  items: FlowExecutionSummary[];
  page: number;
  size: number;
  total: number;
}

export interface FlowExecutionNodeLog {
  nodeId?: string;
  status?: string;
  duration?: number;
  durationMs?: number;
  input?: unknown;
  output?: unknown;
  error?: string | null;
}

export interface FlowExecutionDetail extends FlowExecutionSummary {
  inputParams: Record<string, unknown>;
  outputResult: Record<string, unknown>;
  nodeLogs: FlowExecutionNodeLog[];
}

export interface ListFlowExecutionsParams {
  flowId?: number;
  page?: number;
  size?: number;
}
