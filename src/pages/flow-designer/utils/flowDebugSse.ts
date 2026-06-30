export type FlowDebugNodeStatus = 'idle' | 'running' | 'success' | 'error';

export type FlowDebugEventType =
  | 'flow_node_start'
  | 'flow_node_complete'
  | 'flow_node_error'
  | 'flow_complete';

export interface FlowDebugSseEvent {
  type: FlowDebugEventType;
  timestamp?: string;
  nodeId?: string;
  nodeType?: string;
  durationMs?: number;
  outputPreview?: string;
  code?: string;
  message?: string;
  executionId?: number;
  status?: string;
}

export interface FlowDebugLogEntry {
  id: string;
  type: FlowDebugEventType;
  nodeId?: string;
  message: string;
  timestamp?: string;
}

export function parseFlowDebugPayload(payload: string): FlowDebugSseEvent | null {
  const trimmed = payload.trim();
  if (!trimmed.startsWith('{')) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as FlowDebugSseEvent;
    if (!parsed.type) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function toDebugLogEntry(event: FlowDebugSseEvent, index: number): FlowDebugLogEntry {
  const id = `${event.type}-${event.nodeId ?? 'flow'}-${index}`;
  if (event.type === 'flow_node_start') {
    return {
      id,
      type: event.type,
      nodeId: event.nodeId,
      timestamp: event.timestamp,
      message: `开始执行 ${event.nodeId ?? ''} (${event.nodeType ?? ''})`,
    };
  }
  if (event.type === 'flow_node_complete') {
    return {
      id,
      type: event.type,
      nodeId: event.nodeId,
      timestamp: event.timestamp,
      message: `完成 ${event.nodeId ?? ''} · ${event.durationMs ?? 0}ms`,
    };
  }
  if (event.type === 'flow_node_error') {
    return {
      id,
      type: event.type,
      nodeId: event.nodeId,
      timestamp: event.timestamp,
      message: `失败 ${event.nodeId ?? ''}: ${event.code ?? ''} ${event.message ?? ''}`.trim(),
    };
  }
  return {
    id,
    type: event.type,
    timestamp: event.timestamp,
    message: `流程结束 execution=${event.executionId ?? '-'} status=${event.status ?? ''}`,
  };
}

export function nodeStatusFromEvent(event: FlowDebugSseEvent): {
  nodeId: string;
  status: FlowDebugNodeStatus;
} | null {
  if (!event.nodeId) {
    return null;
  }
  if (event.type === 'flow_node_start') {
    return { nodeId: event.nodeId, status: 'running' };
  }
  if (event.type === 'flow_node_complete') {
    return { nodeId: event.nodeId, status: 'success' };
  }
  if (event.type === 'flow_node_error') {
    return { nodeId: event.nodeId, status: 'error' };
  }
  return null;
}
