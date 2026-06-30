import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FlowDesignerNodeData } from '../utils/flowDslMapper';
import styles from './FlowDesignerNode.less';

const TYPE_COLORS: Record<string, string> = {
  start: '#52c41a',
  end: '#8c8c8c',
  ai: '#1677ff',
  knowledge: '#722ed1',
  classifier: '#13c2c2',
  branch: '#fa8c16',
  script: '#eb2f96',
  http: '#2f54eb',
  subflow: '#597ef7',
  reply: '#389e0d',
};

export default function FlowDesignerNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowDesignerNodeData;
  const accent = TYPE_COLORS[nodeData.flowType] ?? '#595959';
  const debugClass =
    nodeData.debugStatus === 'running'
      ? styles.debugRunning
      : nodeData.debugStatus === 'success'
        ? styles.debugSuccess
        : nodeData.debugStatus === 'error'
          ? styles.debugError
          : '';

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''} ${debugClass}`}
      style={{ borderColor: accent }}
    >
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.typeBadge} style={{ background: accent }}>
        {nodeData.flowType}
      </div>
      <div className={styles.label}>{nodeData.label}</div>
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  );
}
