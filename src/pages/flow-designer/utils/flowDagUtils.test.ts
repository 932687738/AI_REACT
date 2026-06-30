import { describe, expect, it } from 'vitest';
import { validateFlowDag } from './flowDagUtils';
import type { FlowDefinitionDto } from '@/types/flowManagement';

describe('flowDagUtils', () => {
  it('accepts linear start-ai-end dag', () => {
    const definition: FlowDefinitionDto = {
      schemaVersion: 1,
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'ai1', type: 'ai' },
        { id: 'end1', type: 'end' },
      ],
      edges: [
        { source: 'start', target: 'ai1' },
        { source: 'ai1', target: 'end1' },
      ],
    };

    expect(validateFlowDag(definition).valid).toBe(true);
  });

  it('rejects cycle', () => {
    const definition: FlowDefinitionDto = {
      schemaVersion: 1,
      nodes: [
        { id: 'a', type: 'start' },
        { id: 'b', type: 'ai' },
        { id: 'c', type: 'end' },
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'b' },
      ],
    };

    const result = validateFlowDag(definition);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('环路'))).toBe(true);
  });

  it('rejects missing start node', () => {
    const definition: FlowDefinitionDto = {
      schemaVersion: 1,
      nodes: [{ id: 'end1', type: 'end' }],
      edges: [],
    };

    expect(validateFlowDag(definition).valid).toBe(false);
  });
});
