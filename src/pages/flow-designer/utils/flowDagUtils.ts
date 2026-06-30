import type { FlowDefinitionDto } from '@/types/flowManagement';

export interface DagValidationResult {
  valid: boolean;
  errors: string[];
}

const MAX_NODE_COUNT = 50;

function hasCycle(
  nodeIds: string[],
  edges: { source: string; target: string }[],
): boolean {
  const adjacency = new Map<string, string[]>();
  for (const id of nodeIds) {
    adjacency.set(id, []);
  }
  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
  }

  const indegree = new Map<string, number>();
  for (const id of nodeIds) {
    indegree.set(id, 0);
  }
  for (const edge of edges) {
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const queue = nodeIds.filter((id) => (indegree.get(id) ?? 0) === 0);
  let visited = 0;
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    visited += 1;
    for (const next of adjacency.get(current) ?? []) {
      const nextDegree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) {
        queue.push(next);
      }
    }
  }
  return visited !== nodeIds.length;
}

export function validateFlowDag(definition: FlowDefinitionDto): DagValidationResult {
  const errors: string[] = [];
  const nodes = definition.nodes ?? [];
  const edges = definition.edges ?? [];

  if (nodes.length > MAX_NODE_COUNT) {
    errors.push(`节点数不能超过 ${MAX_NODE_COUNT}`);
  }

  const startCount = nodes.filter((n) => n.type === 'start').length;
  const endCount = nodes.filter((n) => n.type === 'end').length;
  if (startCount !== 1) {
    errors.push('必须有且仅有一个开始节点');
  }
  if (endCount < 1) {
    errors.push('至少需要一个结束节点');
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      errors.push(`连线引用了不存在的节点：${edge.source} → ${edge.target}`);
    }
  }

  if (hasCycle(nodes.map((n) => n.id), edges)) {
    errors.push('检测到环路，流程必须是 DAG');
  }

  return { valid: errors.length === 0, errors };
}
