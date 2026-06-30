import { useCallback, useEffect, useMemo, useState } from 'react';
import { history, useIntl } from '@umijs/max';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ApartmentOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { flowDesignerRoute } from '@/constants/routes';
import {
  createFlow,
  deleteFlow,
  disableFlow,
  enableFlow,
  listFlowVersions,
  listFlows,
  publishFlow,
  registerFlowMcpTool,
  rollbackFlow,
} from '@/services/flowService';
import type { FlowStatus, FlowSummary, FlowVersionItem } from '@/types/flowManagement';
import styles from './index.less';

const STATUS_OPTIONS: { label: string; value: FlowStatus }[] = [
  { label: 'draft', value: 'draft' },
  { label: 'published', value: 'published' },
  { label: 'disabled', value: 'disabled' },
];

function statusTagClass(status: FlowStatus): string {
  if (status === 'published') {
    return styles.statusPublished;
  }
  if (status === 'disabled') {
    return styles.statusDisabled;
  }
  return styles.statusDraft;
}

export default function FlowManagementPage() {
  const intl = useIntl();
  const [items, setItems] = useState<FlowSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<FlowStatus | undefined>();
  const [nameKeyword, setNameKeyword] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [versionFlowId, setVersionFlowId] = useState<number | null>(null);
  const [versions, setVersions] = useState<FlowVersionItem[]>([]);
  const [form] = Form.useForm();

  const t = useCallback(
    (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage }),
    [intl],
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listFlows({
        page,
        size: pageSize,
        status: statusFilter,
        name: nameKeyword || undefined,
      });
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch {
      message.error(t('flowManagement.loadFailed', '加载流程列表失败'));
    } finally {
      setLoading(false);
    }
  }, [nameKeyword, page, pageSize, statusFilter, t]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const openDesigner = (flowId: number) => {
    history.push(flowDesignerRoute(flowId));
  };

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      const created = await createFlow({
        name: values.name.trim(),
        description: values.description?.trim(),
      });
      message.success(t('flowManagement.created', '流程已创建'));
      setCreateOpen(false);
      form.resetFields();
      openDesigner(created.id);
    } catch {
      message.error(t('flowManagement.createFailed', '创建失败'));
    }
  };

  const handleDelete = async (flowId: number) => {
    try {
      await deleteFlow(flowId);
      message.success(t('flowManagement.deleted', '已删除'));
      void fetchList();
    } catch {
      message.error(t('flowManagement.deleteFailed', '删除失败，请先解除 Agent 关联'));
    }
  };

  const handlePublish = async (flowId: number) => {
    try {
      await publishFlow(flowId);
      message.success(t('flowManagement.published', '发布成功'));
      void fetchList();
    } catch {
      message.error(t('flowManagement.publishFailed', '发布失败，请检查流程 DSL'));
    }
  };

  const handleRegisterMcp = async (flowId: number) => {
    try {
      const result = await registerFlowMcpTool(flowId);
      message.success(
        t('flowManagement.mcpRegistered', '已发布为 MCP 工具：{name}').replace(
          '{name}',
          result.mcpToolName,
        ),
      );
      void fetchList();
    } catch {
      message.error(t('flowManagement.mcpRegisterFailed', 'MCP 工具注册失败'));
    }
  };

  const openVersions = async (flowId: number) => {
    setVersionFlowId(flowId);
    setVersionOpen(true);
    try {
      const list = await listFlowVersions(flowId);
      setVersions(list ?? []);
    } catch {
      message.error(t('flowManagement.versionLoadFailed', '版本历史加载失败'));
    }
  };

  const handleRollback = async (versionNo: number) => {
    if (versionFlowId === null) {
      return;
    }
    try {
      await rollbackFlow(versionFlowId, { versionNo });
      message.success(t('flowManagement.rollbackDone', '已回滚并生成新版本'));
      const list = await listFlowVersions(versionFlowId);
      setVersions(list ?? []);
      void fetchList();
    } catch {
      message.error(t('flowManagement.rollbackFailed', '回滚失败'));
    }
  };

  const handleToggleEnabled = async (record: FlowSummary, checked: boolean) => {
    try {
      if (checked) {
        await enableFlow(record.id);
        message.success(t('flowManagement.enabledDone', '已启用'));
      } else {
        await disableFlow(record.id);
        message.success(t('flowManagement.disabledDone', '已禁用'));
      }
      void fetchList();
    } catch {
      message.error(t('flowManagement.toggleFailed', '状态切换失败'));
    }
  };

  const columns: ColumnsType<FlowSummary> = useMemo(
    () => [
      {
        title: t('flowManagement.col.name', '名称'),
        dataIndex: 'name',
        key: 'name',
        render: (name: string, record) => (
          <div className={styles.nameCell}>
            <span className={styles.namePrimary}>{name}</span>
            {record.description ? (
              <span className={styles.nameSecondary}>{record.description}</span>
            ) : null}
          </div>
        ),
      },
      {
        title: t('flowManagement.col.status', '状态'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: FlowStatus) => (
          <Tag className={statusTagClass(status)}>{status}</Tag>
        ),
      },
      {
        title: t('flowManagement.col.version', '版本'),
        dataIndex: 'currentVersion',
        key: 'currentVersion',
        width: 90,
        render: (v: number) => (v > 0 ? `v${v}` : '—'),
      },
      {
        title: t('flowManagement.col.enabled', '启用'),
        dataIndex: 'enabled',
        key: 'enabled',
        width: 100,
        render: (enabled: boolean, record) =>
          record.currentVersion > 0 ? (
            <Switch
              checked={enabled && record.status === 'published'}
              disabled={record.status === 'draft'}
              onChange={(checked) => void handleToggleEnabled(record, checked)}
            />
          ) : (
            <Tag>{t('flowManagement.notPublished', '未发布')}</Tag>
          ),
      },
      {
        title: t('flowManagement.col.actions', '操作'),
        key: 'actions',
        width: 420,
        render: (_, record) => (
          <Space wrap size="small">
            <Button
              size="small"
              type="link"
              icon={<EditOutlined />}
              onClick={() => openDesigner(record.id)}
            >
              {t('flowManagement.design', '设计')}
            </Button>
            <Button size="small" type="link" onClick={() => void openVersions(record.id)}>
              {t('flowManagement.versions', '版本历史')}
            </Button>
            <Button size="small" type="link" onClick={() => void handlePublish(record.id)}>
              {t('flowManagement.publish', '发布')}
            </Button>
            {record.status === 'published' && record.enabled ? (
              <Button size="small" type="link" onClick={() => void handleRegisterMcp(record.id)}>
                {t('flowManagement.registerMcp', '发布为 MCP 工具')}
              </Button>
            ) : null}
            <Popconfirm
              title={t('flowManagement.deleteConfirm', '确认删除该流程？')}
              onConfirm={() => void handleDelete(record.id)}
            >
              <Button size="small" type="link" danger>
                {t('flowManagement.delete', '删除')}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [t],
  );

  return (
    <div className={styles.flowPage}>
      <Typography.Title level={3} className={styles.pageHeader}>
        {t('flowManagement.title', 'AI 流程管理')}
      </Typography.Title>
      <p className={styles.pageSubtitle}>
        {t(
          'flowManagement.subtitle',
          '创建、发布与版本化编排流程。草稿保存后可在设计器中编辑节点与连线。',
        )}
      </p>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input.Search
            allowClear
            placeholder={t('flowManagement.search', '按名称搜索')}
            style={{ width: 220 }}
            onSearch={(value) => {
              setNameKeyword(value.trim());
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder={t('flowManagement.statusFilter', '状态筛选')}
            style={{ width: 160 }}
            options={STATUS_OPTIONS.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          />
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void fetchList()} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            {t('flowManagement.create', '新建流程')}
          </Button>
        </Space>
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
            intl.formatMessage({ id: 'flowManagement.tableTotal', defaultMessage: '共 {total} 条' }, { total: count }),
        }}
      />

      <Modal
        title={t('flowManagement.createTitle', '新建流程')}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => void handleCreate()}
        okText={t('flowManagement.createAndDesign', '创建并进入设计器')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('flowManagement.field.name', '流程名称')}
            rules={[{ required: true, message: t('flowManagement.nameRequired', '请输入名称') }]}
          >
            <Input maxLength={128} placeholder="customer-faq-flow" />
          </Form.Item>
          <Form.Item name="description" label={t('flowManagement.field.description', '描述')}>
            <Input.TextArea rows={3} maxLength={512} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <ApartmentOutlined />
            {t('flowManagement.versionTitle', '版本历史')}
          </Space>
        }
        open={versionOpen}
        onCancel={() => setVersionOpen(false)}
        footer={null}
        width={640}
      >
        <Table
          rowKey="id"
          dataSource={versions}
          pagination={false}
          locale={{ emptyText: t('flowManagement.noVersions', '暂无发布版本') }}
          columns={[
            {
              title: t('flowManagement.col.version', '版本'),
              dataIndex: 'versionNo',
              width: 80,
              render: (v: number) => `v${v}`,
            },
            {
              title: t('flowManagement.col.publishedAt', '发布时间'),
              dataIndex: 'publishedAt',
              width: 180,
            },
            {
              title: t('flowManagement.col.publishedBy', '发布人'),
              dataIndex: 'publishedBy',
              width: 120,
              render: (v: string | null) => v ?? '—',
            },
            {
              title: t('flowManagement.col.actions', '操作'),
              key: 'actions',
              render: (_, record) => (
                <Popconfirm
                  title={t('flowManagement.rollbackConfirm', '回滚到此版本并生成新版本？')}
                  onConfirm={() => void handleRollback(record.versionNo)}
                >
                  <Button size="small">{t('flowManagement.rollback', '回滚')}</Button>
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
