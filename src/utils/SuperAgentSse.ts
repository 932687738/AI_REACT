/** SuperAgents SSE 结构化事件解析（与 plain text 兼容） */

export type SuperAgentSseEventType = 'token' | 'progress';

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

export type SuperAgentSseEvent = SuperAgentProgressEvent | SuperAgentTokenEvent;

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
  } catch {
    return null;
  }
  return null;
}

export function dispatchSuperAgentSsePayload(
  raw: string,
  onToken: (text: string) => void,
  onProgress?: (event: SuperAgentProgressEvent) => void,
): boolean {
  const event = parseSuperAgentSsePayload(raw);
  if (!event) {
    return false;
  }
  if (event.type === 'token') {
    onToken(event.text);
    return true;
  }
  onProgress?.(event);
  return true;
}
