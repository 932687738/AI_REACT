/** SuperAgents SSE 结构化事件解析（与 plain text 兼容） */

export type SuperAgentSseEventType = 'token' | 'progress' | 'artifact' | 'meta';

export interface SuperAgentProgressEvent {
  type: 'progress';
  step: string;
  status: string;
  thought?: string;
  toolName?: string;
  toolResultSummary?: string;
  errorMessage?: string;
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
  modelName?: string;
  routingModelName?: string;
  modelProvider?: string;
  routingModelProvider?: string;
  memoryLongCount?: number;
  memoryShortCount?: number;
}

export type SuperAgentSseEvent =
  | SuperAgentProgressEvent
  | SuperAgentTokenEvent
  | SuperAgentArtifactEvent
  | SuperAgentMetaEvent;

export function parsePlainAgentMetaPayload(raw: string): SuperAgentMetaEvent | null {
  const source = String(raw || '').trim();
  if (!source.includes('[Meta]')) {
    return null;
  }
  const meta: SuperAgentMetaEvent = { type: 'meta' };
  for (const line of source.split('\n')) {
    const match = line.trim().match(/^\[Meta\]\s+(\w+)=(.+)$/);
    if (!match) {
      continue;
    }
    const [, key, value] = match;
    if (key === 'text2sqlSessionId') {
      meta.text2sqlSessionId = value;
    } else if (key === 'modelName') {
      meta.modelName = value;
    } else if (key === 'routingModelName') {
      meta.routingModelName = value;
    } else if (key === 'modelProvider') {
      meta.modelProvider = value;
    } else if (key === 'routingModelProvider') {
      meta.routingModelProvider = value;
    } else if (key === 'memoryLongCount') {
      meta.memoryLongCount = Number(value);
    } else if (key === 'memoryShortCount') {
      meta.memoryShortCount = Number(value);
    }
  }
  if (
    meta.text2sqlSessionId
    || meta.modelName
    || meta.routingModelName
    || meta.modelProvider
    || meta.memoryLongCount
    || meta.memoryShortCount
  ) {
    return meta;
  }
  return null;
}

export function isAgentMetaPayload(raw: string): boolean {
  return Boolean(parsePlainAgentMetaPayload(raw));
}

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
  const plainMeta = parsePlainAgentMetaPayload(raw);
  if (plainMeta) {
    onMeta?.(plainMeta);
    return true;
  }
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
