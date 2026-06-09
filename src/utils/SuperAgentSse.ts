/** SuperAgents SSE 结构化事件解析（与 plain text 兼容） */

export type SuperAgentSseEventType = 'token' | 'progress' | 'artifact' | 'meta';

export interface SuperAgentProgressEvent {
  type: 'progress';
  step: string;
  status: string;
  thought?: string;
  toolName?: string;
  toolResultSummary?: string;
}

export interface SuperAgentTokenEvent {
  type: 'token';
  text: string;
}

export type ChatArtifactKind = 'sql-review' | 'table' | 'code';

export interface ChatArtifactPayload {
  id: string;
  kind: ChatArtifactKind;
  title?: string;
  displayDialect?: string;
  executionDialect?: string;
  content?: string;
  summary?: string;
  actions?: string[];
  status?: string;
  columns?: Array<{ key: string; title: string; valueType?: string }>;
  rows?: Record<string, unknown>[];
  page?: { current?: number; pageSize?: number; total?: number; truncated?: boolean };
  language?: string;
}

export interface SuperAgentArtifactEvent {
  type: 'artifact';
  artifact: ChatArtifactPayload;
}

export interface SuperAgentMetaEvent {
  type: 'meta';
  text2sqlSessionId?: string;
  sessionId?: string;
  knowledgeBaseNames?: string[];
  knowledgeBaseCount?: number;
}

export type SuperAgentSseEvent =
  | SuperAgentProgressEvent
  | SuperAgentTokenEvent
  | SuperAgentArtifactEvent
  | SuperAgentMetaEvent;

export function parseSuperAgentSsePayload(raw: string): SuperAgentSseEvent | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as { type?: string };
    if (parsed.type === 'progress') {
      return parsed as SuperAgentProgressEvent;
    }
    if (parsed.type === 'token') {
      return parsed as SuperAgentTokenEvent;
    }
    if (parsed.type === 'artifact') {
      return parsed as SuperAgentArtifactEvent;
    }
    if (parsed.type === 'meta') {
      return parsed as SuperAgentMetaEvent;
    }
  } catch {
    return null;
  }
  return null;
}

export function dispatchSuperAgentSsePayload(
  raw: string,
  onToken: (text: string) => void,
  onProgress?: (event: SuperAgentProgressEvent) => void,
  onArtifact?: (event: SuperAgentArtifactEvent) => void,
  onMeta?: (event: SuperAgentMetaEvent) => void,
): boolean {
  const event = parseSuperAgentSsePayload(raw);
  if (!event) {
    return false;
  }
  if (event.type === 'token') {
    onToken(event.text);
    return true;
  }
  if (event.type === 'artifact') {
    onArtifact?.(event);
    return true;
  }
  if (event.type === 'meta') {
    onMeta?.(event);
    return true;
  }
  onProgress?.(event);
  return true;
}
