import {
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useCallback, useMemo, useState } from 'react';
import PlatformAdminSettingsDrawer from '@/components/platformAdmin/PlatformAdminSettingsDrawer';
import styles from '@/components/platformAdmin/platformScreen.less';
import { usePlatformAdminConfig } from '@/hooks/usePlatformAdminConfig';
import {
  closeSuspendedWorkflow,
  deleteSuspendedWorkflow,
  getSuspendedWorkflowDetail,
  listSuspendedWorkflows,
  resumeSuspendedWorkflow,
} from '@/services/platformSuspendedWorkflowService';
import type {
  WorkflowSuspendDetail,
  WorkflowSuspendItem,
  WorkflowSuspendListQuery,
} from '@/types/platformSuspendedWorkflow';
import {
  getPlatformErrorMessage,
  handlePlatformUnauthorized,
} from '@/utils/platformUnauthorized';

const QUERY_KEY = ['platform-suspended-workflows'] as const;

const STATUS_COLORS: Record<string, string> = {
  SUSPENDED: 'warning',
  RESUMED: 'success',
  CLOSED: 'default',
};

type FilterForm = {
  keyword?: string;
  status?: string;
  skillName?: string;
};

export default function PlatformSuspendedWorkflowManager() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const admin = usePlatformAdminConfig();
  const [filterForm] = Form.useForm<FilterForm>();
  const [filters, setFilters] = useState<WorkflowSuspendListQuery>({ page: 1, pageSize: 20 });
  const [detailToken, setDetailToken] = useState<string | null>(null);
  const [resumeOutput, setResumeOutput] = useState('');
  const [actionToken, setActionToken] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: [...QUERY_KEY, admin.tenantId, filters],
    queryFn: () => listSuspendedWorkflows(filters),
  });

  const detailQuery = useQuery({
    queryKey: [...QUERY_KEY, 'detail', admin.tenantId, detailToken],
    queryFn: () => getSuspendedWorkflowDetail(detailToken!),
    enabled: !!detailToken,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const handleWriteError = useCallback(
    (err: unknown, failedId: string) => {
      if (
        handlePlatformUnauthorized(
          err,
          admin.openConfig,
          intl.formatMessage({ id: 'platformAdmin.unauthorized' }),
        )
      ) {
        return;
      }
      message.error(getPlatformErrorMessage(err, intl.formatMessage({ id: failedId })));
    },
    [admin.openConfig, intl],
  );

  const closeMutation = useMutation({
    mutationFn: closeSuspendedWorkflow,
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'platformSuspendedWorkflow.closeSuccess' }));
      invalidate();
      setDetailToken(null);
    },
    onError: (err: unknown) =>
      handleWriteError(err, 'platformSuspendedWorkflow.closeFailed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSuspendedWorkflow,
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'platformSuspendedWorkflow.deleteSuccess' }));
      invalidate();
      setDetailToken(null);
    },
    onError: (err: unknown) =>
      handleWriteError(err, 'platformSuspendedWorkflow.deleteFailed'),
  });

  const resumeMutation = useMutation({
    mutationFn: (token: string) => {
      setResumeOutput('');
      return resumeSuspendedWorkflow(token, {
        onChunk: (text) => setResumeOutput((prev) => prev + text),
      });
    },
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'platformSuspendedWorkflow.resumeSuccess' }));
      invalidate();
    },
    onError: (err: unknown) => {
      if (
        handlePlatformUnauthorized(
          err,
          admin.openConfig,
          intl.formatMessage({ id: 'platformAdmin.unauthorized' }),
        )
      ) {
        return;
      }
      message.error(
        getPlatformErrorMessage(err, intl.formatMessage({ id: 'platformSuspendedWorkflow.resumeFailed' })),
      );
    },
    onSettled: () => setActionToken(null),
  });

  const confirmClose = useCallback(
    (token: string) => {
      Modal.confirm({
        title: intl.formatMessage({ id: 'platformSuspendedWorkflow.closeConfirmTitle' }),
        content: intl.formatMessage({ id: 'platformSuspendedWorkflow.closeConfirmBody' }),
        okType: 'danger',
        onOk: () => closeMutation.mutateAsync(token),
      });
    },
    [closeMutation, intl],
  );

  const confirmDelete = useCallback(
    (token: string) => {
      Modal.confirm({
        title: intl.formatMessage({ id: 'platformSuspendedWorkflow.deleteConfirmTitle' }),
        content: intl.formatMessage({ id: 'platformSuspendedWorkflow.deleteConfirmBody' }),
        okType: 'danger',
        onOk: () => deleteMutation.mutateAsync(token),
      });
    },
    [deleteMutation, intl],
  );

  const columns: ColumnsType<WorkflowSuspendItem> = useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'platformSuspendedWorkflow.col.session' }),
        dataIndex: 'sessionId',
        ellipsis: true,
      },
      {
        title: intl.formatMessage({ id: 'platformSuspendedWorkflow.col.skill' }),
        dataIndex: 'skillName',
        ellipsis: true,
        render: (value: string | null | undefined) => value || '—',
      },
      {
        title: intl.formatMessage({ id: 'platformSuspendedWorkflow.col.status' }),
        dataIndex: 'status',
        width: 120,
        render: (status: string) => (
          <Tag color={STATUS_COLORS[status] ?? 'default'}>{status}</Tag>
        ),
      },
      {
        title: intl.formatMessage({ id: 'platformSuspendedWorkflow.col.token' }),
        dataIndex: 'resumeTokenMasked',
        width: 160,
      },
      {
        title: intl.formatMessage({ id: 'platformSuspendedWorkflow.col.createdAt' }),
        dataIndex: 'createdAt',
        width: 190,
        render: (value: string) => new Date(value).toLocaleString(),
      },
      {
        title: intl.formatMessage({ id: 'platformSuspendedWorkflow.col.actions' }),
        key: 'actions',
        width: 280,
        render: (_, row) => (
          <Space size="small" wrap>
            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailToken(row.resumeToken)}>
              {intl.formatMessage({ id: 'platformSuspendedWorkflow.detail' })}
            </Button>
            {row.status === 'SUSPENDED' ? (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  loading={actionToken === row.resumeToken && resumeMutation.isPending}
                  onClick={() => {
                    setActionToken(row.resumeToken);
                    resumeMutation.mutate(row.resumeToken);
                  }}
                >
                  {intl.formatMessage({ id: 'platformSuspendedWorkflow.resume' })}
                </Button>
                <Button
                  size="small"
                  icon={<CloseCircleOutlined />}
                  loading={closeMutation.isPending}
                  onClick={() => confirmClose(row.resumeToken)}
                >
                  {intl.formatMessage({ id: 'platformSuspendedWorkflow.close' })}
                </Button>
              </>
            ) : null}
            {row.status === 'RESUMED' || row.status === 'CLOSED' ? (
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
                onClick={() => confirmDelete(row.resumeToken)}
              >
                {intl.formatMessage({ id: 'platformSuspendedWorkflow.delete' })}
              </Button>
            ) : null}
          </Space>
        ),
      },
    ],
    [
      intl,
      actionToken,
      resumeMutation,
      closeMutation.isPending,
      deleteMutation.isPending,
      confirmClose,
      confirmDelete,
    ],
  );

  const pagination: TablePaginationConfig = {
    current: listQuery.data?.page ?? filters.page ?? 1,
    pageSize: listQuery.data?.pageSize ?? filters.pageSize ?? 20,
    total: listQuery.data?.total ?? 0,
    showSizeChanger: true,
    onChange: (page, pageSize) => setFilters((prev) => ({ ...prev, page, pageSize })),
  };

  const renderDetail = (detail: WorkflowSuspendDetail) => (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item label={intl.formatMessage({ id: 'platformSuspendedWorkflow.col.token' })}>
        <Typography.Text copyable>{detail.resumeToken}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label={intl.formatMessage({ id: 'platformSuspendedWorkflow.col.session' })}>
        {detail.sessionId}
      </Descriptions.Item>
      <Descriptions.Item label={intl.formatMessage({ id: 'platformSuspendedWorkflow.col.skill' })}>
        {detail.skillName || '—'}
      </Descriptions.Item>
      <Descriptions.Item label={intl.formatMessage({ id: 'platformSuspendedWorkflow.col.status' })}>
        <Tag color={STATUS_COLORS[detail.status] ?? 'default'}>{detail.status}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label={intl.formatMessage({ id: 'platformSuspendedWorkflow.col.createdAt' })}>
        {new Date(detail.createdAt).toLocaleString()}
      </Descriptions.Item>
      {detail.resumedAt ? (
        <Descriptions.Item label={intl.formatMessage({ id: 'platformSuspendedWorkflow.resumedAt' })}>
          {new Date(detail.resumedAt).toLocaleString()}
        </Descriptions.Item>
      ) : null}
      {detail.closedAt ? (
        <Descriptions.Item label={intl.formatMessage({ id: 'platformSuspendedWorkflow.closedAt' })}>
          {new Date(detail.closedAt).toLocaleString()}
        </Descriptions.Item>
      ) : null}
      <Descriptions.Item label={intl.formatMessage({ id: 'platformSuspendedWorkflow.pendingMessage' })}>
        {detail.pendingMessage || '—'}
      </Descriptions.Item>
    </Descriptions>
  );

  return (
    <section className={`${styles.screen} nebula-platform-suspended-workflows-screen`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Typography.Title level={3} className={styles.title}>
            {intl.formatMessage({ id: 'platformSuspendedWorkflow.title' })}
          </Typography.Title>
          <Typography.Paragraph className={styles.subtitle}>
            {intl.formatMessage({ id: 'platformSuspendedWorkflow.subtitle' })}
          </Typography.Paragraph>
        </div>
        <div className={styles.toolbar}>
          <Button icon={<SettingOutlined />} onClick={() => admin.setConfigOpen(true)}>
            {intl.formatMessage({ id: 'platformSkill.config' })}
          </Button>
          <Button icon={<ReloadOutlined />} loading={listQuery.isLoading} onClick={() => void listQuery.refetch()}>
            {intl.formatMessage({ id: 'agentHub.refresh' })}
          </Button>
        </div>
      </header>

      <Form
        form={filterForm}
        layout="inline"
        style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}
        onFinish={(values) =>
          setFilters((prev) => ({
            ...prev,
            page: 1,
            keyword: values.keyword,
            status: values.status,
            skillName: values.skillName,
          }))
        }
      >
        <Form.Item name="keyword">
          <Input
            allowClear
            placeholder={intl.formatMessage({ id: 'platformSuspendedWorkflow.filter.keyword' })}
            style={{ minWidth: 200 }}
          />
        </Form.Item>
        <Form.Item name="status">
          <Select
            allowClear
            placeholder={intl.formatMessage({ id: 'platformSuspendedWorkflow.filter.status' })}
            style={{ minWidth: 140 }}
            options={[
              { value: 'SUSPENDED', label: 'SUSPENDED' },
              { value: 'RESUMED', label: 'RESUMED' },
              { value: 'CLOSED', label: 'CLOSED' },
            ]}
          />
        </Form.Item>
        <Form.Item name="skillName">
          <Input
            allowClear
            placeholder={intl.formatMessage({ id: 'platformSuspendedWorkflow.filter.skill' })}
            style={{ minWidth: 160 }}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {intl.formatMessage({ id: 'platformSuspendedWorkflow.search' })}
            </Button>
            <Button
              onClick={() => {
                filterForm.resetFields();
                setFilters({ page: 1, pageSize: filters.pageSize ?? 20 });
              }}
            >
              {intl.formatMessage({ id: 'platformSuspendedWorkflow.reset' })}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {listQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message={intl.formatMessage({ id: 'platformSuspendedWorkflow.loadFailed' })}
          action={
            <Button size="small" onClick={() => void listQuery.refetch()}>
              {intl.formatMessage({ id: 'agentHub.retry' })}
            </Button>
          }
        />
      ) : null}

      <div className={styles.tableCard}>
        <Table<WorkflowSuspendItem>
          rowKey="resumeToken"
          columns={columns}
          dataSource={listQuery.data?.items ?? []}
          loading={listQuery.isLoading}
          pagination={pagination}
          locale={{
            emptyText: intl.formatMessage({ id: 'platformSuspendedWorkflow.empty' }),
          }}
        />
      </div>

      {resumeOutput ? (
        <Alert
          style={{ marginTop: 16 }}
          type="info"
          message={intl.formatMessage({ id: 'platformSuspendedWorkflow.resumePreview' })}
          description={<pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{resumeOutput}</pre>}
          closable
          onClose={() => setResumeOutput('')}
        />
      ) : null}

      <Drawer
        title={intl.formatMessage({ id: 'platformSuspendedWorkflow.detailTitle' })}
        open={!!detailToken}
        onClose={() => setDetailToken(null)}
        width={Math.min(560, typeof window !== 'undefined' ? window.innerWidth - 24 : 560)}
      >
        {detailQuery.isLoading ? (
          <Typography.Text type="secondary">
            {intl.formatMessage({ id: 'platformSuspendedWorkflow.loadingDetail' })}
          </Typography.Text>
        ) : null}
        {detailQuery.isError ? (
          <Alert
            type="error"
            message={intl.formatMessage({ id: 'platformSuspendedWorkflow.detailFailed' })}
          />
        ) : null}
        {detailQuery.data ? renderDetail(detailQuery.data) : null}
      </Drawer>

      <PlatformAdminSettingsDrawer
        open={admin.configOpen}
        onClose={() => admin.setConfigOpen(false)}
        tenantId={admin.tenantId}
        adminKey={admin.adminKey}
        onTenantIdChange={admin.setTenantId}
        onAdminKeyChange={admin.setAdminKey}
      />
    </section>
  );
}
