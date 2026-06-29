import { describe, expect, it } from 'vitest';
import { dispatchSuperAgentSsePayload, parsePlainAgentMetaPayload, parseSuperAgentSsePayload } from '@/utils/SuperAgentSse';
import { parseAgentAssistantText } from '@/utils/agentChatDisplay';

describe('SuperAgentSse artifact', () => {
  it('parses artifact event', () => {
    const raw = JSON.stringify({
      type: 'artifact',
      artifact: { id: 'a1', kind: 'sql-review', content: 'SELECT 1' },
    });
    const event = parseSuperAgentSsePayload(raw);
    expect(event?.type).toBe('artifact');
    if (event?.type === 'artifact') {
      expect(event.artifact.kind).toBe('sql-review');
    }
  });

  it('dispatches token progress and artifact', () => {
    const tokens: string[] = [];
    const artifacts: string[] = [];
    const progress: string[] = [];

    expect(
      dispatchSuperAgentSsePayload(
        JSON.stringify({ type: 'token', text: 'hi' }),
        (t) => tokens.push(t),
        (p) => progress.push(p.step),
        (a) => artifacts.push(a.artifact.id),
      ),
    ).toBe(true);

    expect(
      dispatchSuperAgentSsePayload(
        JSON.stringify({ type: 'artifact', artifact: { id: 'x', kind: 'table' } }),
        (t) => tokens.push(t),
        (p) => progress.push(p.step),
        (a) => artifacts.push(a.artifact.id),
      ),
    ).toBe(true);

    expect(tokens).toEqual(['hi']);
    expect(artifacts).toEqual(['x']);
  });

  it('parses and dispatches meta event with text2sqlSessionId', () => {
    const raw = JSON.stringify({ type: 'meta', text2sqlSessionId: '42' });
    const event = parseSuperAgentSsePayload(raw);
    expect(event?.type).toBe('meta');

    const metas: string[] = [];
    dispatchSuperAgentSsePayload(
      raw,
      () => undefined,
      undefined,
      undefined,
      (meta) => {
        if (meta.text2sqlSessionId) {
          metas.push(meta.text2sqlSessionId);
        }
      },
    );
    expect(metas).toEqual(['42']);
  });

  it('parses plain meta model lines', () => {
    const raw = '[Meta] modelName=qwen-plus\n[Meta] routingModelName=qwen-turbo\n';
    const meta = parsePlainAgentMetaPayload(raw);
    expect(meta?.modelName).toBe('qwen-plus');
    expect(meta?.routingModelName).toBe('qwen-turbo');
  });

  it('parses routing model segment from assistant text', () => {
    const parsed = parseAgentAssistantText(
      '【路由】智能体：customer-service | Skill：无 | 工具：子 Agent 内置能力 | 模型：qwen-plus（路由：qwen-turbo）\n\n你好',
    );
    expect(parsed.routing?.modelLabel).toBe('qwen-plus');
    expect(parsed.routing?.routingModelLabel).toBe('qwen-turbo');
    expect(parsed.body).toBe('你好');
  });
});
