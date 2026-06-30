import { Typography } from 'antd';
import {
  FLOW_END_NODE,
  FLOW_NODE_CATALOG,
  FLOW_START_NODE,
  type FlowNodeCatalogItem,
} from '../flowNodeCatalog';
import styles from './NodePalette.less';

interface NodePaletteProps {
  readonly: boolean;
  hasStartNode: boolean;
  onDragStart: (event: React.DragEvent, item: FlowNodeCatalogItem) => void;
}

function PaletteItem({
  item,
  disabled,
  onDragStart,
}: {
  item: FlowNodeCatalogItem;
  disabled?: boolean;
  onDragStart: NodePaletteProps['onDragStart'];
}) {
  return (
    <div
      className={`${styles.item} ${disabled ? styles.disabled : ''}`}
      draggable={!disabled}
      onDragStart={(event) => {
        if (!disabled) {
          onDragStart(event, item);
        }
      }}
    >
      <span className={styles.itemType}>{item.type}</span>
      <span className={styles.itemLabel}>{item.defaultLabel}</span>
      <Typography.Text type="secondary" className={styles.itemDesc}>
        {item.description}
      </Typography.Text>
    </div>
  );
}

export default function NodePalette({ readonly, hasStartNode, onDragStart }: NodePaletteProps) {
  return (
    <aside className={styles.palette}>
      <Typography.Text strong className={styles.title}>
        节点面板
      </Typography.Text>
      <Typography.Paragraph type="secondary" className={styles.hint}>
        拖拽到画布；Delete 删除选中项
      </Typography.Paragraph>
      <div className={styles.section}>
        <Typography.Text type="secondary" className={styles.sectionTitle}>
          控制
        </Typography.Text>
        <PaletteItem
          item={FLOW_START_NODE}
          disabled={readonly || hasStartNode}
          onDragStart={onDragStart}
        />
        <PaletteItem item={FLOW_END_NODE} disabled={readonly} onDragStart={onDragStart} />
      </div>
      <div className={styles.section}>
        <Typography.Text type="secondary" className={styles.sectionTitle}>
          业务节点
        </Typography.Text>
        {FLOW_NODE_CATALOG.map((item) => (
          <PaletteItem key={item.type} item={item} disabled={readonly} onDragStart={onDragStart} />
        ))}
      </div>
    </aside>
  );
}
