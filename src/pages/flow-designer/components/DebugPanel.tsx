import { useCallback, useState } from 'react';
import { Button, Input, Space, Tag, Typography, message } from 'antd';
import { BugOutlined, ClearOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { debugFlowStream } from '@/services/flowService';
import type { FlowDebugLogEntry, FlowDebugNodeStatus } from '../utils/flowDebugSse';
import { parseFlowDebugPayload, toDebugLogEntry, nodeStatusFromEvent } from '../utils/flowDebugSse';
import styles from './DebugPanel.less';

export interface DebugPanelProps {
  flowId: number;
  onPrepareDebug?: () => Promise<void>;
  onNodeStatusChange: (nodeId: string, status: FlowDebugNodeStatus) => void;
  onResetNodeStatus: () => void;
}

function logClassName(type: FlowDebugLogEntry['type']): string {
  if (type === 'flow_node_error') {
    return styles.logError;
  }
  if (type === 'flow_node_complete' || type === 'flow_complete') {
    return styles.logSuccess;
  }
  return styles.logRunning;
}

export default function DebugPanel({
  flowId,
  onPrepareDebug,
  onNodeStatusChange,
  onResetNodeStatus,
}: DebugPanelProps) {
  const [paramsJson, setParamsJson] = useState('{\n  "question": "测试问题"\n}');
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<FlowDebugLogEntry[]>([]);

  const handleClear = useCallback(() => {
    setLogs([]);
    onResetNodeStatus();
  }, [onResetNodeStatus]);

  const handleRun = useCallback(async () => {
    let params: Record<string, unknown> = {};
    try {
      params = JSON.parse(paramsJson) as Record<string, unknown>;
    } catch {
      message.error('调试参数 JSON 格式无效');
      return;
    }

    setRunning(true);
    onResetNodeStatus();
    setLogs([]);

    try {
      if (onPrepareDebug) {
        await onPrepareDebug();
      }
      await debugFlowStream(flowId, params, (payload) => {
        const event = parseFlowDebugPayload(payload);
        if (!event) {
          return;
        }
        setLogs((prev) => [...prev, toDebugLogEntry(event, prev.length)]);
        const nodeUpdate = nodeStatusFromEvent(event);
        if (nodeUpdate) {
          onNodeStatusChange(nodeUpdate.nodeId, nodeUpdate.status);
        }
      });
    } catch (error) {
      const messageText =
        error instanceof Error && error.message ? error.message : '调试运行失败';
      message.error(messageText);
    } finally {
      setRunning(false);
    }
  }, [flowId, onPrepareDebug, onNodeStatusChange, onResetNodeStatus, paramsJson]);

  return (
    <section className={styles.debugPanel} aria-label="flow debug panel">
      <div className={styles.toolbar}>
        <Space size={8} wrap>
          <Tag icon={<BugOutlined />} color="processing">
            实时调试
          </Tag>
          <Typography.Text type="secondary">SSE 逐节点执行，结果写入执行记录</Typography.Text>
        </Space>
        <Space wrap>
          <Button icon={<ClearOutlined />} onClick={handleClear} disabled={running}>
            清空
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={running}
            onClick={() => void handleRun()}
          >
            运行调试
          </Button>
        </Space>
      </div>
      <Input.TextArea
        className={styles.paramsInput}
        rows={2}
        value={paramsJson}
        onChange={(event) => setParamsJson(event.target.value)}
        placeholder='{"question":"..."}'
      />
      <div className={styles.logList}>
        {logs.length === 0 ? (
          <div className={styles.emptyLog}>运行后将在此显示节点事件日志</div>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className={`${styles.logItem} ${logClassName(entry.type)}`}>
              <span className={styles.logTime}>{entry.timestamp?.slice(11, 19) ?? '--:--:--'}</span>
              <span>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
