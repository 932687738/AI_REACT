import { useCallback, useEffect, useState } from 'react';
import { history, useIntl, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Descriptions,
  Space,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ROUTES } from '@/constants/routes';
import { getFlowExecution } from '@/services/flowService';
import type { FlowExecutionDetail, FlowExecutionNodeLog } from '@/types/flowExecution';
import styles from './index.less';

function formatJson(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function FlowExecutionDetailPage() {
  const intl = useIntl();
  const params = useParams<{ executionId: string }>();
  const executionId = Number(params.executionId);
  const [detail, setDetail] = useState<FlowExecutionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const t = useCallback(
    (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage }),
    [intl],
  );

  useEffect(() => {
    if (!Number.isFinite(executionId)) {
      message.error(t('flowExecutions.invalidId', '无效的执行 ID'));
      history.push(ROUTES.FLOW_EXECUTIONS);
      return;
    }
    setLoading(true);
    getFlowExecution(executionId)
      .then(setDetail)
      .catch(() => {
        message.error(t('flowExecutions.detailLoadFailed', '加载执行详情失败'));
        history.push(ROUTES.FLOW_EXECUTIONS);
      })
      .finally(() => setLoading(false));
  }, [executionId, t]);

  if (loading || !detail) {
    return (
      <div className={styles.flowExecutionsPage}>
        <Spin />
      </div>
    );
  }

  return (
    <div className={styles.flowExecutionsPage}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space align="center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.push(ROUTES.FLOW_EXECUTIONS)}>
            {t('flowExecutions.back', '返回列表')}
          </Button>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('flowExecutions.detailTitle', '执行详情')} #{detail.id}
          </Typography.Title>
        </Space>

        <Card title={t('flowExecutions.overview', '概览')} className={styles.detailSection}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label={t('flowExecutions.col.flow', '流程')}>
              {detail.flowName} (#{detail.flowId} · v{detail.flowVersion})
            </Descriptions.Item>
            <Descriptions.Item label={t('flowExecutions.col.trigger', '触发方式')}>
              <Tag>{detail.triggerType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('flowExecutions.col.status', '状态')}>
              <Tag>{detail.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('flowExecutions.col.duration', '耗时')}>
              {detail.durationMs === null || detail.durationMs === undefined
                ? '—'
                : `${detail.durationMs} ms`}
            </Descriptions.Item>
            <Descriptions.Item label="traceId">{detail.traceId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label={t('flowExecutions.col.createdAt', '创建时间')}>
              {detail.createdAt}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title={t('flowExecutions.inputParams', '输入参数')} className={styles.detailSection}>
          <pre className={styles.mono}>{formatJson(detail.inputParams)}</pre>
        </Card>

        <Card title={t('flowExecutions.outputResult', '输出结果')} className={styles.detailSection}>
          <pre className={styles.mono}>{formatJson(detail.outputResult)}</pre>
        </Card>

        <Card title={t('flowExecutions.nodeTrace', '节点轨迹')} className={styles.detailSection}>
          <Timeline
            items={detail.nodeLogs.map((log: FlowExecutionNodeLog, index) => ({
              color: log.status === 'failed' ? 'red' : 'green',
              children: (
                <Card size="small" className={styles.nodeLogCard}>
                  <Typography.Text strong>
                    {log.nodeId ?? `node-${index + 1}`}
                  </Typography.Text>
                  <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
                    <Descriptions.Item label={t('flowExecutions.col.status', '状态')}>
                      {log.status ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('flowExecutions.col.duration', '耗时')}>
                      {log.duration ?? log.durationMs ?? '—'} ms
                    </Descriptions.Item>
                    <Descriptions.Item label="input">
                      <pre className={styles.mono}>{formatJson(log.input)}</pre>
                    </Descriptions.Item>
                    <Descriptions.Item label="output">
                      <pre className={styles.mono}>{formatJson(log.output)}</pre>
                    </Descriptions.Item>
                    {log.error ? (
                      <Descriptions.Item label="error">
                        <Typography.Text type="danger">{log.error}</Typography.Text>
                      </Descriptions.Item>
                    ) : null}
                  </Descriptions>
                </Card>
              ),
            }))}
          />
        </Card>
      </Space>
    </div>
  );
}
