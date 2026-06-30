import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Space, Spin, Tag, Typography, message } from 'antd';
import { history, useIntl, useParams } from '@umijs/max';
import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { ROUTES } from '@/constants/routes';
import { getFlow, updateFlow } from '@/services/flowService';
import type { FlowDetail, FlowStatus } from '@/types/flowManagement';
import FlowCanvas, { addEdge } from './components/FlowCanvas';
import DebugPanel from './components/DebugPanel';
import NodeInspector from './components/NodeInspector';
import NodePalette from './components/NodePalette';
import type { FlowNodeCatalogItem } from './flowNodeCatalog';
import { validateFlowDag } from './utils/flowDagUtils';
import {
  createDesignerNode,
  emptyFlowDefinition,
  fromFlowDefinition,
  toFlowDefinition,
  type FlowDesignerNodeData,
} from './utils/flowDslMapper';
import type { FlowDebugNodeStatus } from './utils/flowDebugSse';
import styles from './index.less';

function statusClass(status: FlowStatus): string {
  if (status === 'published') {
    return styles.statusPublished;
  }
  if (status === 'disabled') {
    return styles.statusDisabled;
  }
  return styles.statusDraft;
}

function DesignerWorkspace({ flowId }: { flowId: number }) {
  const intl = useIntl();
  const { screenToFlowPosition } = useReactFlow();
  const [flow, setFlow] = useState<FlowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node<FlowDesignerNodeData> | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowDesignerNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const readonly = flow?.status !== 'draft';

  const t = useCallback(
    (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage }),
    [intl],
  );

  const loadFlow = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await getFlow(flowId);
      setFlow(detail);
      const definition =
        detail.definition?.nodes?.length > 0
          ? detail.definition
          : emptyFlowDefinition();
      const graph = fromFlowDefinition(definition);
      setNodes(graph.nodes);
      setEdges(graph.edges);
    } catch {
      message.error(t('flowDesigner.loadFailed', '加载流程失败'));
    } finally {
      setLoading(false);
    }
  }, [flowId, setEdges, setNodes, t]);

  useEffect(() => {
    void loadFlow();
  }, [loadFlow]);

  const hasStartNode = useMemo(
    () => nodes.some((node) => node.data.flowType === 'start'),
    [nodes],
  );

  const onPaletteDragStart = useCallback((event: React.DragEvent, item: FlowNodeCatalogItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (readonly) {
        return;
      }
      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) {
        return;
      }
      const item = JSON.parse(raw) as FlowNodeCatalogItem;
      if (item.type === 'start' && hasStartNode) {
        message.warning(t('flowDesigner.singleStart', '只能有一个开始节点'));
        return;
      }
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode = createDesignerNode(item.type, position);
      newNode.data.label = item.defaultLabel;
      setNodes((nds) => nds.concat(newNode));
    },
    [hasStartNode, readonly, screenToFlowPosition, setNodes, t],
  );

  const handleNodeConfigChange = useCallback(
    (nodeId: string, config: Record<string, unknown>, label?: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  label: label ?? node.data.label,
                  config,
                },
              }
            : node,
        ),
      );
      setSelectedNode((current) =>
        current?.id === nodeId
          ? {
              ...current,
              data: {
                ...current.data,
                label: label ?? current.data.label,
                config,
              },
            }
          : current,
      );
    },
    [setNodes],
  );

  const handleNodeDebugStatusChange = useCallback(
    (nodeId: string, status: FlowDebugNodeStatus) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  debugStatus: status,
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const handleResetNodeDebugStatus = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          debugStatus: 'idle' as const,
        },
      })),
    );
  }, [setNodes]);

  const prepareDebug = useCallback(async () => {
    if (!flow || readonly) {
      throw new Error(t('flowDesigner.readonlyHint', '已发布/已禁用流程为只读，请复制为新草稿后再编辑'));
    }
    const definition = toFlowDefinition(nodes, edges);
    const validation = validateFlowDag(definition);
    if (!validation.valid) {
      throw new Error(validation.errors[0]);
    }
    const updated = await updateFlow(flowId, {
      definition,
      expectedUpdatedAt: flow.updatedAt,
    });
    setFlow(updated);
  }, [edges, flow, flowId, nodes, readonly, t]);

  const handleSave = async () => {
    if (!flow || readonly) {
      return;
    }
    const definition = toFlowDefinition(nodes, edges);
    const validation = validateFlowDag(definition);
    if (!validation.valid) {
      message.error(validation.errors[0]);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateFlow(flowId, {
        definition,
        expectedUpdatedAt: flow.updatedAt,
      });
      setFlow(updated);
      message.success(t('flowDesigner.saved', '草稿已保存'));
    } catch {
      message.error(t('flowDesigner.saveFailed', '保存失败'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.designerPage}>
      <header className={styles.header}>
        <div>
          <Typography.Title level={4} className={styles.title}>
            {flow?.name ?? t('flowDesigner.title', '流程设计器')}
          </Typography.Title>
          <Space size={8}>
            <Tag className={statusClass(flow?.status ?? 'draft')}>{flow?.status}</Tag>
            <Typography.Text type="secondary">ID {flowId}</Typography.Text>
          </Space>
        </div>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.push(ROUTES.FLOW_MANAGEMENT)}>
            {t('flowDesigner.backToList', '返回列表')}
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            disabled={readonly}
            onClick={() => void handleSave()}
          >
            {t('flowDesigner.saveDraft', '保存草稿')}
          </Button>
        </Space>
      </header>

      {readonly && (
        <Alert
          type="info"
          showIcon
          className={styles.readonlyBanner}
          message={t('flowDesigner.readonlyHint', '已发布/已禁用流程为只读，请复制为新草稿后再编辑')}
        />
      )}

      <div className={styles.workspace}>
        <NodePalette
          readonly={readonly}
          hasStartNode={hasStartNode}
          onDragStart={onPaletteDragStart}
        />
        <main className={styles.canvasArea}>
          <div className={styles.canvasStack}>
            <FlowCanvas
              nodes={nodes}
              edges={edges}
              readonly={readonly}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onSelectionChange={setSelectedNode}
            />
          </div>
          <DebugPanel
            flowId={flowId}
            onPrepareDebug={prepareDebug}
            onNodeStatusChange={handleNodeDebugStatusChange}
            onResetNodeStatus={handleResetNodeDebugStatus}
          />
        </main>
        <NodeInspector
          node={selectedNode}
          readonly={readonly}
          onChange={handleNodeConfigChange}
        />
      </div>
    </div>
  );
}

export default function FlowDesignerPage() {
  const params = useParams<{ flowId: string }>();
  const flowId = Number(params.flowId);

  if (!Number.isFinite(flowId) || flowId <= 0) {
    return <Typography.Text type="danger">Invalid flow id</Typography.Text>;
  }

  return (
    <ReactFlowProvider>
      <DesignerWorkspace flowId={flowId} />
    </ReactFlowProvider>
  );
}
