import { useCallback, useEffect, useMemo, useState } from 'react';
import { history, useIntl } from '@umijs/max';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { ROUTES } from '@/constants/routes';
import type { PromptTemplate } from '@/types/promptManagement';
import type { PromptExperimentVariant, PromptInvokeLog } from '@/types/promptManagement';
import {
  createPromptTemplate,
  deletePromptTemplate,
  getPromptExperiment,
  listPromptInvokeLogs,
  listPromptTemplateVersions,
  listPromptTemplates,
  rollbackPromptTemplate,
  savePromptExperiment,
  updatePromptTemplate,
} from '@/services/promptManagementService';
import styles from './index.less';

const { TextArea } = Input;
const { Paragraph } = Typography;

const DEFAULT_SCENE = 'agent.system.default';

export default function PromptManagementPage() {
  const intl = useIntl();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [form] = Form.useForm();
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versions, setVersions] = useState<PromptTemplate[]>([]);
  const [invokeDrawerOpen, setInvokeDrawerOpen] = useState(false);
  const [invokeLogs, setInvokeLogs] = useState<PromptInvokeLog[]>([]);
  const [invokeTotal, setInvokeTotal] = useState(0);
  const [experimentVariants, setExperimentVariants] = useState<PromptExperimentVariant[]>([]);
  const [experimentScene, setExperimentScene] = useState(DEFAULT_SCENE);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPromptTemplates({
        page,
        size: 10,
        keyword: keyword || undefined,
        category,
      });
      setTemplates(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch {
      message.error(intl.formatMessage({ id: 'promptManagement.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
    }
  }, [category, intl, keyword, page]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const categories = useMemo(
    () => Array.from(new Set(templates.map((t) => t.category))).filter(Boolean),
    [templates],
  );

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ category: '自定义', tags: [] });
    setEditorOpen(true);
  };

  const openEdit = (record: PromptTemplate) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      category: record.category,
      content: record.content,
      tags: record.tags?.join(', '),
    });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const tags = String(values.tags ?? '')
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);
    try {
      if (editing) {
        await updatePromptTemplate(editing.name, {
          description: values.description,
          category: values.category,
          content: values.content,
          tags,
        });
        message.success(intl.formatMessage({ id: 'promptManagement.updated', defaultMessage: '已保存新版本' }));
      } else {
        await createPromptTemplate({
          name: values.name,
          description: values.description,
          category: values.category,
          content: values.content,
          tags,
        });
        message.success(intl.formatMessage({ id: 'promptManagement.created', defaultMessage: '模板已创建' }));
      }
      setEditorOpen(false);
      void fetchList();
    } catch {
      message.error(intl.formatMessage({ id: 'promptManagement.saveFailed', defaultMessage: '保存失败' }));
    }
  };

  const openVersions = async (record: PromptTemplate) => {
    setVersionName(record.name);
    setVersionModalOpen(true);
    try {
      const items = await listPromptTemplateVersions(record.name);
      setVersions(items);
    } catch {
      message.error(intl.formatMessage({ id: 'promptManagement.versionLoadFailed', defaultMessage: '版本加载失败' }));
    }
  };

  const handleRollback = async (version: number) => {
    try {
      await rollbackPromptTemplate(versionName, { version });
      message.success(intl.formatMessage({ id: 'promptManagement.rollbackDone', defaultMessage: '已回滚' }));
      const items = await listPromptTemplateVersions(versionName);
      setVersions(items);
      void fetchList();
    } catch {
      message.error(intl.formatMessage({ id: 'promptManagement.rollbackFailed', defaultMessage: '回滚失败' }));
    }
  };

  const openInvokes = async (record: PromptTemplate) => {
    setVersionName(record.name);
    setInvokeDrawerOpen(true);
    try {
      const res = await listPromptInvokeLogs(record.name, { page: 1, size: 50 });
      setInvokeLogs(res.items ?? []);
      setInvokeTotal(res.total ?? 0);
    } catch {
      message.error(intl.formatMessage({ id: 'promptManagement.invokeLoadFailed', defaultMessage: '调用记录加载失败' }));
    }
  };

  const loadExperiment = async (sceneKey: string) => {
    setExperimentScene(sceneKey);
    try {
      const res = await getPromptExperiment(sceneKey);
      setExperimentVariants(res.variants ?? []);
    } catch {
      setExperimentVariants([]);
    }
  };

  useEffect(() => {
    void loadExperiment(DEFAULT_SCENE);
  }, []);

  const weightTotal = experimentVariants.reduce((sum, v) => sum + (v.weightPercent ?? 0), 0);

  const saveExperiment = async () => {
    if (weightTotal !== 100) {
      message.warning(intl.formatMessage({ id: 'promptManagement.weightInvalid' }));
      return;
    }
    try {
      await savePromptExperiment(experimentScene, { variants: experimentVariants });
      message.success(intl.formatMessage({ id: 'promptManagement.experimentSaved' }));
    } catch {
      message.error(intl.formatMessage({ id: 'promptManagement.experimentSaveFailed' }));
    }
  };

  const t = (id: string, defaultMessage?: string) =>
    intl.formatMessage({ id, ...(defaultMessage ? { defaultMessage } : {}) });

  const columns: ColumnsType<PromptTemplate> = useMemo(
    () => [
      { title: t('promptManagement.col.name'), dataIndex: 'name', key: 'name', width: 180 },
      { title: t('promptManagement.col.category'), dataIndex: 'category', key: 'category', width: 100 },
      {
        title: t('promptManagement.col.version'),
        dataIndex: 'version',
        key: 'version',
        width: 80,
        render: (v: number) => <Tag color="blue">v{v}</Tag>,
      },
      {
        title: t('promptManagement.col.source'),
        dataIndex: 'source',
        key: 'source',
        width: 90,
        render: (s: string) => <Tag>{s}</Tag>,
      },
      {
        title: t('promptManagement.col.content'),
        dataIndex: 'content',
        key: 'content',
        ellipsis: true,
        render: (text: string) => <Paragraph ellipsis={{ rows: 1 }}>{text}</Paragraph>,
      },
      {
        title: t('promptManagement.col.actions'),
        key: 'actions',
        width: 280,
        render: (_, record) => (
          <Space wrap>
            <Button size="small" onClick={() => openEdit(record)}>
              {t('promptManagement.edit')}
            </Button>
            <Button size="small" onClick={() => void openVersions(record)}>
              {t('promptManagement.versions')}
            </Button>
            <Button size="small" onClick={() => void openInvokes(record)}>
              {t('promptManagement.invokes')}
            </Button>
            {record.source !== 'preset' ? (
              <Popconfirm
                title={t('promptManagement.deleteConfirm')}
                onConfirm={async () => {
                  try {
                    await deletePromptTemplate(record.name);
                    message.success(t('promptManagement.deleted', '已删除'));
                    void fetchList();
                  } catch {
                    message.error(t('promptManagement.deleteFailed', '删除失败'));
                  }
                }}
              >
                <Button size="small" danger>
                  {t('promptManagement.delete')}
                </Button>
              </Popconfirm>
            ) : null}
          </Space>
        ),
      },
    ],
    [fetchList, intl],
  );

  return (
    <div className={styles.page}>
      <Card
        title={t('promptManagement.title')}
        extra={
          <Space>
            <Button onClick={() => history.push(ROUTES.CHAT_AGENT)}>
              {t('promptManagement.backToChat')}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => void fetchList()} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('promptManagement.create')}
            </Button>
          </Space>
        }
      >
        <Tabs
          items={[
            {
              key: 'templates',
              label: t('promptManagement.tabTemplates'),
              children: (
                <>
                  <Space style={{ marginBottom: 16 }} wrap>
                    <Input.Search
                      placeholder={t('promptManagement.search')}
                      allowClear
                      onSearch={(v) => {
                        setKeyword(v);
                        setPage(1);
                      }}
                      style={{ width: 220 }}
                    />
                    <Select
                      allowClear
                      placeholder={t('promptManagement.category')}
                      style={{ width: 160 }}
                      options={categories.map((c) => ({ label: c, value: c }))}
                      onChange={(v) => {
                        setCategory(v);
                        setPage(1);
                      }}
                    />
                  </Space>
                  <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={templates}
                    pagination={{
                      current: page,
                      total,
                      pageSize: 10,
                      onChange: setPage,
                      showTotal: (count) =>
                        intl.formatMessage({ id: 'promptManagement.table.total' }, { total: count }),
                    }}
                  />
                </>
              ),
            },
            {
              key: 'experiments',
              label: t('promptManagement.tabExperiments'),
              children: (
                <div className={styles.experimentPanel}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Input
                      addonBefore={t('promptManagement.experiment.scene')}
                      value={experimentScene}
                      onChange={(e) => setExperimentScene(e.target.value)}
                      onBlur={() => void loadExperiment(experimentScene)}
                    />
                    {experimentVariants.map((variant, index) => (
                      <Space key={`${variant.templateName}-${variant.version}`} wrap>
                        <Input
                          placeholder={t('promptManagement.experiment.templateName')}
                          value={variant.templateName}
                          onChange={(e) => {
                            const next = [...experimentVariants];
                            next[index] = { ...variant, templateName: e.target.value };
                            setExperimentVariants(next);
                          }}
                          style={{ width: 180 }}
                        />
                        <InputNumber
                          min={1}
                          value={variant.version}
                          onChange={(v) => {
                            const next = [...experimentVariants];
                            next[index] = { ...variant, version: v ?? 1 };
                            setExperimentVariants(next);
                          }}
                        />
                        <InputNumber
                          min={0}
                          max={100}
                          addonAfter="%"
                          value={variant.weightPercent}
                          onChange={(v) => {
                            const next = [...experimentVariants];
                            next[index] = { ...variant, weightPercent: v ?? 0 };
                            setExperimentVariants(next);
                          }}
                        />
                        <Button
                          danger
                          onClick={() =>
                            setExperimentVariants(experimentVariants.filter((_, i) => i !== index))
                          }
                        >
                          {t('promptManagement.experiment.remove')}
                        </Button>
                      </Space>
                    ))}
                    <Space>
                      <Button
                        onClick={() =>
                          setExperimentVariants([
                            ...experimentVariants,
                            { templateName: '', version: 1, weightPercent: 0 },
                          ])
                        }
                      >
                        {t('promptManagement.experiment.addVariant')}
                      </Button>
                      <Tag color={weightTotal === 100 ? 'success' : 'error'}>
                        {t('promptManagement.experiment.total')}: {weightTotal}%
                      </Tag>
                      <Button type="primary" onClick={() => void saveExperiment()}>
                        {t('promptManagement.experiment.save')}
                      </Button>
                    </Space>
                  </Space>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        title={editing ? t('promptManagement.editTitle') : t('promptManagement.createTitle')}
        width={560}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        extra={
          <Button type="primary" onClick={() => void handleSave()}>
            {t('promptManagement.save')}
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('promptManagement.field.name')} rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="description" label={t('promptManagement.field.description')}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label={t('promptManagement.field.category')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tags" label={t('promptManagement.field.tags')}>
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label={t('promptManagement.field.content')}
            rules={[{ required: true }]}
            extra={t('promptManagement.field.contentExtra')}
          >
            <TextArea rows={12} maxLength={8000} showCount />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title={`${t('promptManagement.versions')}: ${versionName}`}
        open={versionModalOpen}
        onCancel={() => setVersionModalOpen(false)}
        footer={null}
        width={720}
      >
        <Table
          rowKey="id"
          dataSource={versions}
          pagination={false}
          columns={[
            { title: t('promptManagement.col.version'), dataIndex: 'version', width: 90 },
            { title: t('promptManagement.col.status'), dataIndex: 'status', width: 100 },
            { title: t('promptManagement.col.createdBy'), dataIndex: 'createdBy', width: 120 },
            {
              title: t('promptManagement.col.actions'),
              render: (_, record) =>
                record.status !== 'active' ? (
                  <Popconfirm
                    title={t('promptManagement.rollbackConfirm')}
                    onConfirm={() => void handleRollback(record.version)}
                  >
                    <Button size="small">{t('promptManagement.rollback')}</Button>
                  </Popconfirm>
                ) : (
                  <Tag color="green">{t('promptManagement.statusActive')}</Tag>
                ),
            },
          ]}
        />
      </Modal>

      <Drawer
        title={`${t('promptManagement.invokes')}: ${versionName}`}
        width={720}
        open={invokeDrawerOpen}
        onClose={() => setInvokeDrawerOpen(false)}
      >
        <Table
          rowKey="id"
          dataSource={invokeLogs}
          pagination={{ total: invokeTotal, pageSize: 50 }}
          columns={[
            { title: t('promptManagement.col.version'), dataIndex: 'version', width: 80 },
            { title: t('promptManagement.col.type'), dataIndex: 'invokeType', width: 80 },
            {
              title: t('promptManagement.col.tokens'),
              render: (_, r) => `${r.promptTokens ?? '-'} / ${r.completionTokens ?? '-'}`,
            },
            { title: t('promptManagement.col.duration'), dataIndex: 'durationMs', width: 90 },
            { title: t('promptManagement.col.time'), dataIndex: 'createdAt', width: 180 },
          ]}
        />
      </Drawer>
    </div>
  );
}
