import { useCallback, useEffect, useMemo, useState } from 'react';
import { history, useIntl } from '@umijs/max';
import { Button, Input, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { flowExecutionDetailRoute } from '@/constants/routes';
import { listFlowExecutions } from '@/services/flowService';
import type { FlowExecutionStatus, FlowExecutionSummary } from '@/types/flowExecution';
import styles from './index.less';

function statusTagClass(status: FlowExecutionStatus): string {
  if (status === 'success') {
    return styles.statusSuccess;
  }
  if (status === 'failed') {
    return styles.statusFailed;
  }
  if (status === 'running') {
    return styles.statusRunning;
  }
  return styles.statusDefault;
}

function formatDuration(durationMs: number | null): string {
  if (durationMs === null || durationMs === undefined) {
    return '—';
  }
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }
  return `${(durationMs / 1000).toFixed(2)} s`;
}

function formatTokenUsage(tokenUsage: Record<string, unknown>): string {
  const total = tokenUsage?.total;
  if (total === null || total === undefined) {
    return '—';
  }
  return String(total);
}

export default function FlowExecutionsPage() {
  const intl = useIntl();
  const [items, setItems] = useState<FlowExecutionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [flowIdFilter, setFlowIdFilter] = useState('');

  const t = useCallback(
    (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage }),
    [intl],
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const flowId = flowIdFilter.trim() ? Number(flowIdFilter.trim()) : undefined;
      const res = await listFlowExecutions({
        page,
        size: pageSize,
        flowId: Number.isFinite(flowId) ? flowId : undefined,
      });
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch {
      message.error(t('flowExecutions.loadFailed', '加载执行记录失败'));
    } finally {
      setLoading(false);
    }
  }, [flowIdFilter, page, pageSize, t]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const columns: ColumnsType<FlowExecutionSummary> = useMemo(
    () => [
      {
        title: t('flowExecutions.col.id', '执行 ID'),
        dataIndex: 'id',
        key: 'id',
        width: 100,
      },
      {
        title: t('flowExecutions.col.flow', '流程'),
        key: 'flow',
        render: (_, record) => (
          <div>
            <div>{record.flowName}</div>
            <Typography.Text type="secondary" className={styles.mono}>
              #{record.flowId} · v{record.flowVersion}
            </Typography.Text>
          </div>
        ),
      },
      {
        title: t('flowExecutions.col.trigger', '触发方式'),
        dataIndex: 'triggerType',
        key: 'triggerType',
        width: 100,
        render: (value: string) => <Tag>{value}</Tag>,
      },
      {
        title: t('flowExecutions.col.status', '状态'),
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: FlowExecutionStatus) => (
          <Tag className={statusTagClass(status)}>{status}</Tag>
        ),
      },
      {
        title: t('flowExecutions.col.duration', '耗时'),
        dataIndex: 'durationMs',
        key: 'durationMs',
        width: 100,
        render: (value: number | null) => formatDuration(value),
      },
      {
        title: t('flowExecutions.col.tokens', 'Token'),
        key: 'tokenUsage',
        width: 90,
        render: (_, record) => formatTokenUsage(record.tokenUsage),
      },
      {
        title: t('flowExecutions.col.createdAt', '创建时间'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
      },
      {
        title: t('flowExecutions.col.actions', '操作'),
        key: 'actions',
        width: 100,
        render: (_, record) => (
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => history.push(flowExecutionDetailRoute(record.id))}
          >
            {t('flowExecutions.detail', '详情')}
          </Button>
        ),
      },
    ],
    [t],
  );

  return (
    <div className={styles.flowExecutionsPage}>
      <Typography.Title level={3} className={styles.pageHeader}>
        {t('flowExecutions.title', '流程执行记录')}
      </Typography.Title>
      <p className={styles.pageSubtitle}>
        {t(
          'flowExecutions.subtitle',
          '审计每次流程运行的触发来源、耗时与节点轨迹。支持按 flowId 筛选。',
        )}
      </p>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            allowClear
            placeholder={t('flowExecutions.flowIdFilter', '按 flowId 筛选')}
            style={{ width: 180 }}
            value={flowIdFilter}
            onChange={(event) => setFlowIdFilter(event.target.value)}
            onPressEnter={() => {
              setPage(1);
              void fetchList();
            }}
          />
          <Button
            onClick={() => {
              setPage(1);
              void fetchList();
            }}
          >
            {t('flowExecutions.search', '查询')}
          </Button>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => void fetchList()} />
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={items}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          onChange: setPage,
          showTotal: (count) =>
            intl.formatMessage(
              { id: 'flowExecutions.tableTotal', defaultMessage: '共 {total} 条' },
              { total: count },
            ),
        }}
      />
    </div>
  );
}
