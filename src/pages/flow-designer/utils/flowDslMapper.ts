import type { Edge, Node } from '@xyflow/react';
import type { FlowDefinitionDto, FlowNodeDto } from '@/types/flowManagement';
import { catalogByType, defaultDataForType } from '../flowNodeCatalog';

export const FLOW_DESIGNER_NODE_TYPE = 'flowDesigner';

export interface FlowDesignerNodeData extends Record<string, unknown> {
  flowType: string;
  label: string;
  config: Record<string, unknown>;
  debugStatus?: 'idle' | 'running' | 'success' | 'error';
}

export function createDesignerNode(
  flowType: string,
  position: { x: number; y: number },
  id?: string,
): Node<FlowDesignerNodeData> {
  const catalog = catalogByType(flowType);
  return {
    id: id ?? `${flowType}_${Date.now().toString(36)}`,
    type: FLOW_DESIGNER_NODE_TYPE,
    position,
    data: {
      flowType,
      label: catalog?.defaultLabel ?? flowType,
      config: defaultDataForType(flowType),
    },
  };
}

function toDesignerNode(node: FlowNodeDto): Node<FlowDesignerNodeData> {
  const catalog = catalogByType(node.type);
  const config = { ...defaultDataForType(node.type), ...(node.data ?? {}) };
  return {
    id: node.id,
    type: FLOW_DESIGNER_NODE_TYPE,
    position: node.position ?? { x: 0, y: 0 },
    data: {
      flowType: node.type,
      label: catalog?.defaultLabel ?? node.type,
      config,
    },
  };
}

export function fromFlowDefinition(definition: FlowDefinitionDto): {
  nodes: Node<FlowDesignerNodeData>[];
  edges: Edge[];
} {
  const nodes = (definition.nodes ?? []).map((node) => toDesignerNode(node));
  const edges = (definition.edges ?? []).map((edge, index) => ({
    id: `e_${edge.source}_${edge.target}_${index}`,
    source: edge.source,
    target: edge.target,
  }));
  return { nodes, edges };
}

export function toFlowDefinition(
  nodes: Node<FlowDesignerNodeData>[],
  edges: Edge[],
): FlowDefinitionDto {
  return {
    schemaVersion: 1,
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.data.flowType,
      position: { x: node.position.x, y: node.position.y },
      data: node.data.config,
    })),
    edges: edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  };
}

export function emptyFlowDefinition(): FlowDefinitionDto {
  const start = createDesignerNode('start', { x: 80, y: 120 }, 'start_1');
  const end = createDesignerNode('end', { x: 420, y: 120 }, 'end_1');
  return toFlowDefinition([start, end], [{ id: 'e0', source: start.id, target: end.id }]);
}
