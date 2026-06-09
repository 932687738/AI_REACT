import { describe, expect, it } from 'vitest';
import { dispatchSuperAgentSsePayload, parseSuperAgentSsePayload } from '@/utils/SuperAgentSse';

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
});
