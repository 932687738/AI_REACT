import type { ChatStreamHandlers } from '@/types/chat';
import { resolveEnvString } from '@/utils/envString';
import { dispatchSuperAgentSsePayload } from '@/utils/SuperAgentSse';

function resolveApiBase(raw: string | undefined): string {
  return resolveEnvString(raw, '').replace(/\/+$/, '');
}

function buildUrl(path: string): string {
  const base = resolveApiBase(process.env.API_BASE as string | undefined);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!base) {
    return normalizedPath;
  }
  return `${base}${normalizedPath}`;
}

function normalizeSseBuffer(buffer: string): string {
  return buffer.replace(/\r\n/g, '\n');
}

function splitSseEvents(buffer: string, final = false) {
  const normalized = normalizeSseBuffer(buffer);
  const events: string[] = [];
  let remaining = normalized;

  let boundary = remaining.indexOf('\n\n');
  while (boundary !== -1) {
    events.push(remaining.slice(0, boundary));
    remaining = remaining.slice(boundary + 2);
    boundary = remaining.indexOf('\n\n');
  }

  if (final && remaining.trim()) {
    events.push(remaining);
    remaining = '';
  }

  return { events, remaining };
}

function parseSseEvent(eventBlock: string): string | null {
  const dataLines: string[] = [];

  for (const line of eventBlock.split('\n')) {
    if (!line || line.startsWith(':')) {
      continue;
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^\s/, ''));
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  const data = dataLines.join('\n');
  return data === '[DONE]' ? null : data;
}

function shouldIncludePayload(payload: string, handlers: ChatStreamHandlers): boolean {
  if (typeof handlers.includeInFullText === 'function') {
    return handlers.includeInFullText(payload);
  }
  return true;
}

function consumeSseBuffer(buffer: string, onData: (payload: string) => void, final = false): string {
  const { events, remaining } = splitSseEvents(buffer, final);

  for (const event of events) {
    const data = parseSseEvent(event);
    if (data !== null) {
      onData(data);
    }
  }

  return remaining;
}

export class RequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
  }
}

/** SSE POST；仅此模块允许 fetch（见 design §4.3） */
export async function postStream(
  path: string,
  data: unknown,
  handlers: ChatStreamHandlers = {},
): Promise<string> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, text/plain, application/json',
      ...(handlers.headers || {}),
    },
    body: JSON.stringify(data ?? {}),
  });

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const body = (await response.json()) as { message?: string; code?: string };
        if (body.message) {
          errorMessage = body.message;
        }
      } else {
        const text = await response.text();
        if (text.trim()) {
          errorMessage = text.trim();
        }
      }
    } catch {
      // keep default message
    }
    throw new RequestError(errorMessage, response.status);
  }

  const contentType = response.headers.get('content-type') || '';
  const isEventStream = contentType.includes('text/event-stream');

  if (!response.body) {
    const text = await response.text();
    if (isEventStream) {
      let fullText = '';
      consumeSseBuffer(text, (payload) => {
        if (shouldIncludePayload(payload, handlers)) {
          fullText += payload;
        }
        handlers.onChunk?.(payload);
      }, true);
      handlers.onComplete?.(fullText);
      return fullText;
    }

    handlers.onChunk?.(text);
    handlers.onComplete?.(text);
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let sseBuffer = '';

  const appendPayload = (payload: string) => {
    const handled = dispatchSuperAgentSsePayload(
      payload,
      (text) => {
        if (shouldIncludePayload(text, handlers)) {
          fullText += text;
        }
        handlers.onChunk?.(text);
      },
      handlers.onProgress,
      handlers.onArtifact,
      handlers.onMeta,
    );
    if (handled) {
      return;
    }
    if (shouldIncludePayload(payload, handlers)) {
      fullText += payload;
    }
    handlers.onChunk?.(payload);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });

    if (isEventStream) {
      sseBuffer += chunk;
      sseBuffer = consumeSseBuffer(sseBuffer, appendPayload);
      continue;
    }

    appendPayload(chunk);
  }

  if (isEventStream) {
    consumeSseBuffer(sseBuffer, appendPayload, true);
  }

  handlers.onComplete?.(fullText);
  return fullText;
}
