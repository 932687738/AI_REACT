import { useCallback } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FlowDesignerNode from './FlowDesignerNode';
import {
  FLOW_DESIGNER_NODE_TYPE,
  type FlowDesignerNodeData,
} from '../utils/flowDslMapper';
import styles from './FlowCanvas.less';

const nodeTypes = { [FLOW_DESIGNER_NODE_TYPE]: FlowDesignerNode };

export interface FlowCanvasProps {
  nodes: Node<FlowDesignerNodeData>[];
  edges: Edge[];
  readonly: boolean;
  onNodesChange: (changes: NodeChange<Node<FlowDesignerNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Connection) => void;
  onDrop: (event: React.DragEvent) => void;
  onSelectionChange: (node: Node<FlowDesignerNodeData> | null) => void;
}

export default function FlowCanvas({
  nodes,
  edges,
  readonly,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onSelectionChange,
}: FlowCanvasProps) {
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      onSelectionChange((selectedNodes[0] as Node<FlowDesignerNodeData> | undefined) ?? null);
    },
    [onSelectionChange],
  );

  return (
    <div className={styles.canvasWrap}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={readonly ? undefined : onNodesChange}
        onEdgesChange={readonly ? undefined : onEdgesChange}
        onConnect={readonly ? undefined : onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={handleSelectionChange}
        fitView
        deleteKeyCode={readonly ? null : ['Backspace', 'Delete']}
        nodesDraggable={!readonly}
        nodesConnectable={!readonly}
        elementsSelectable={!readonly}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={18} size={1} />
        <Controls showInteractive={!readonly} />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}

export { addEdge };
