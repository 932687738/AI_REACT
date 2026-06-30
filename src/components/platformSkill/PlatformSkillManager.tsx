import {
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import PlatformAdminSettingsDrawer from '@/components/platformAdmin/PlatformAdminSettingsDrawer';
import { usePlatformAdminConfig } from '@/hooks/usePlatformAdminConfig';
import {
  listPlatformSkills,
  publishPlatformSkill,
  transitionPlatformSkillStatus,
} from '@/services/platformSkillService';
import type {
  PlatformSkill,
  PlatformCodeSkill,
  PlatformSkillStatus,
  PlatformSkillStatusTarget,
  PlatformSkillStep,
  PublishPlatformSkillInput,
} from '@/types/platformSkill';
import { SKILL_STATUS_TRANSITIONS } from '@/types/platformSkill';
import {
  getPlatformErrorMessage,
  handlePlatformUnauthorized,
} from '@/utils/platformUnauthorized';
import styles from './platformSkill.less';

const SKILLS_QUERY_KEY = ['platform-skills'] as const;

const STATUS_COLORS: Record<PlatformSkillStatus, string> = {
  active: 'success',
  deprecated: 'warning',
  observed: 'processing',
  deleted: 'default',
};

const DEFAULT_STEPS: PlatformSkillStep[] = [
  {
    order: 1,
    instruction: '检索知识库中的相关政策与说明',
    tool: 'searchPlatformKnowledge',
  },
  {
    order: 2,
    instruction: '根据检索结果用简体中文向用户说明可执行步骤',
    tool: '',
  },
];

function normalizeStatus(raw: string): PlatformSkillStatus {
  const lower = raw?.toLowerCase() as PlatformSkillStatus;
  if (lower === 'deprecated' || lower === 'observed' || lower === 'deleted') {
    return lower;
  }
  return 'active';
}

export default function PlatformSkillManager() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const admin = usePlatformAdminConfig();
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishForm] = Form.useForm<PublishPlatformSkillInput>();

  const { data: skillCatalog, isLoading, isError, refetch } = useQuery({
    queryKey: [...SKILLS_QUERY_KEY, admin.tenantId],
    queryFn: listPlatformSkills,
  });
  const skills = skillCatalog?.dbSkills ?? [];
  const codeSkills = skillCatalog?.codeSkills ?? [];

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
  };

  const publishMutation = useMutation({
    mutationFn: publishPlatformSkill,
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'platformSkill.publishSuccess' }));
      setPublishOpen(false);
      publishForm.resetFields();
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
        getPlatformErrorMessage(err, intl.formatMessage({ id: 'platformSkill.publishFailed' })),
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      name,
      version,
      targetStatus,
    }: {
      name: string;
      version: number;
      targetStatus: PlatformSkillStatusTarget;
    }) => transitionPlatformSkillStatus(name, version, targetStatus),
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'platformSkill.statusSuccess' }));
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
        getPlatformErrorMessage(err, intl.formatMessage({ id: 'platformSkill.statusFailed' })),
      );
    },
  });

  const sortedSkills = useMemo(
    () =>
      [...skills].sort((a, b) => {
        const nameCmp = a.name.localeCompare(b.name);
        if (nameCmp !== 0) {
          return nameCmp;
        }
        return b.version - a.version;
      }),
    [skills],
  );

  const openPublish = () => {
    publishForm.setFieldsValue({
      name: '',
      description: '',
      createdBy: 'nebula-desk',
      toolWhitelist: ['searchPlatformKnowledge'],
      steps: DEFAULT_STEPS,
    });
    setPublishOpen(true);
  };

  const codeSkillColumns: ColumnsType<PlatformCodeSkill> = [
    {
      title: intl.formatMessage({ id: 'platformSkill.col.name' }),
      dataIndex: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: intl.formatMessage({ id: 'platformSkill.col.kind' }),
      dataIndex: 'kind',
      width: 140,
      render: () => (
        <Tag color="geekblue">{intl.formatMessage({ id: 'platformSkill.kind.compiledGraph' })}</Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'platformSkill.col.description' }),
      dataIndex: 'description',
      render: (description: string) => (
        <span className={styles.descCell}>{description || '—'}</span>
      ),
    },
  ];

  const columns: ColumnsType<PlatformSkill> = [
    {
      title: intl.formatMessage({ id: 'platformSkill.col.name' }),
      key: 'name',
      render: (_, row) => (
        <div className={styles.nameCell}>
          <strong>{row.name}</strong>
          <span>v{row.version}</span>
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'platformSkill.col.status' }),
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const normalized = normalizeStatus(status);
        return (
          <Tag color={STATUS_COLORS[normalized]}>
            {intl.formatMessage({ id: `platformSkill.status.${normalized}` })}
          </Tag>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'platformSkill.col.description' }),
      dataIndex: 'description',
      render: (text: string) => <div className={styles.descCell}>{text}</div>,
    },
    {
      title: intl.formatMessage({ id: 'platformSkill.col.tools' }),
      dataIndex: 'toolWhitelist',
      width: 200,
      render: (tools: string[]) => (
        <div className={styles.toolTags}>
          {(tools ?? []).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'platformSkill.col.actions' }),
      key: 'actions',
      width: 200,
      render: (_, row) => {
        const status = normalizeStatus(row.status);
        const targets = SKILL_STATUS_TRANSITIONS[status];
        if (!targets.length) {
          return <Typography.Text type="secondary">—</Typography.Text>;
        }
        return (
          <Select
            size="small"
            placeholder={intl.formatMessage({ id: 'platformSkill.transitionPlaceholder' })}
            style={{ minWidth: 140 }}
            loading={statusMutation.isPending}
            options={targets.map((t) => ({
              value: t,
              label: intl.formatMessage({ id: `platformSkill.statusTarget.${t}` }),
            }))}
            onChange={(value: PlatformSkillStatusTarget) =>
              statusMutation.mutate({
                name: row.name,
                version: row.version,
                targetStatus: value,
              })
            }
          />
        );
      },
    },
  ];

  return (
    <section className={`${styles.screen} nebula-platform-skill-screen`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Typography.Title level={3} className={styles.title}>
            {intl.formatMessage({ id: 'platformSkill.title' })}
          </Typography.Title>
          <Typography.Paragraph className={styles.subtitle}>
            {intl.formatMessage({ id: 'platformSkill.subtitle' })}
          </Typography.Paragraph>
        </div>
        <div className={styles.toolbar}>
          <Button icon={<SettingOutlined />} onClick={() => admin.setConfigOpen(true)}>
            {intl.formatMessage({ id: 'platformSkill.config' })}
          </Button>
          <Button icon={<ReloadOutlined />} loading={isLoading} onClick={() => void refetch()}>
            {intl.formatMessage({ id: 'agentHub.refresh' })}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openPublish}>
            {intl.formatMessage({ id: 'platformSkill.publish' })}
          </Button>
        </div>
      </header>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message={intl.formatMessage({ id: 'platformSkill.loadFailed' })}
          action={
            <Button size="small" onClick={() => void refetch()}>
              {intl.formatMessage({ id: 'agentHub.retry' })}
            </Button>
          }
        />
      ) : null}

      <div className={styles.tableCard}>
        <Typography.Title level={5} className={styles.sectionTitle}>
          {intl.formatMessage({ id: 'platformSkill.section.db' })}
        </Typography.Title>
        <Table<PlatformSkill>
          rowKey={(row) => `${row.name}-${row.version}`}
          columns={columns}
          dataSource={sortedSkills}
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{
            emptyText: intl.formatMessage({ id: 'platformSkill.empty' }),
          }}
        />
      </div>

      <div className={styles.tableCard}>
        <Typography.Title level={5} className={styles.sectionTitle}>
          {intl.formatMessage({ id: 'platformSkill.section.code' })}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className={styles.sectionHint}>
          {intl.formatMessage({ id: 'platformSkill.codeHint' })}
        </Typography.Paragraph>
        <Table<PlatformCodeSkill>
          rowKey="name"
          columns={codeSkillColumns}
          dataSource={codeSkills}
          loading={isLoading}
          pagination={false}
          locale={{
            emptyText: intl.formatMessage({ id: 'platformSkill.codeEmpty' }),
          }}
        />
      </div>

      <PlatformAdminSettingsDrawer
        open={admin.configOpen}
        onClose={() => admin.setConfigOpen(false)}
        tenantId={admin.tenantId}
        adminKey={admin.adminKey}
        onTenantIdChange={admin.setTenantId}
        onAdminKeyChange={admin.setAdminKey}
      />

      <Drawer
        title={intl.formatMessage({ id: 'platformSkill.publishTitle' })}
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        width={Math.min(720, typeof window !== 'undefined' ? window.innerWidth - 24 : 720)}
        destroyOnClose
      >
        <Form
          form={publishForm}
          layout="vertical"
          onFinish={(values) => {
            const steps = (values.steps ?? []).map((step, index) => ({
              order: Number(step.order) || index + 1,
              instruction: step.instruction,
              tool: step.tool?.trim() || undefined,
            }));
            publishMutation.mutate({
              ...values,
              steps,
              toolWhitelist: values.toolWhitelist ?? [],
            });
          }}
        >
          <div className={styles.drawerSection}>
            <h4>{intl.formatMessage({ id: 'platformSkill.section.meta' })}</h4>
            <Form.Item
              name="name"
              label={intl.formatMessage({ id: 'platformSkill.field.name' })}
              rules={[{ required: true }]}
            >
              <Input placeholder="refund-guide" />
            </Form.Item>
            <Form.Item
              name="description"
              label={intl.formatMessage({ id: 'platformSkill.field.description' })}
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="createdBy" label={intl.formatMessage({ id: 'platformSkill.field.createdBy' })}>
              <Input />
            </Form.Item>
            <Form.Item
              name="toolWhitelist"
              label={intl.formatMessage({ id: 'platformSkill.field.toolWhitelist' })}
              rules={[{ required: true }]}
            >
              <Select mode="tags" placeholder="searchPlatformKnowledge" />
            </Form.Item>
          </div>

          <div className={styles.drawerSection}>
            <h4>{intl.formatMessage({ id: 'platformSkill.section.steps' })}</h4>
            <Form.List name="steps">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <div key={field.key} className={styles.stepRow}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'order']}
                        rules={[{ required: true }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber min={1} placeholder="#" style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'instruction']}
                        rules={[{ required: true }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder={intl.formatMessage({ id: 'platformSkill.field.instruction' })} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'tool']}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder={intl.formatMessage({ id: 'platformSkill.field.tool' })} />
                      </Form.Item>
                      <Button type="text" danger onClick={() => remove(field.name)}>
                        {intl.formatMessage({ id: 'platformSkill.removeStep' })}
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" block onClick={() => add({ order: fields.length + 1, instruction: '', tool: '' })}>
                    {intl.formatMessage({ id: 'platformSkill.addStep' })}
                  </Button>
                </>
              )}
            </Form.List>
          </div>

          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => setPublishOpen(false)}>
              {intl.formatMessage({ id: 'platformSkill.cancel' })}
            </Button>
            <Button type="primary" htmlType="submit" loading={publishMutation.isPending}>
              {intl.formatMessage({ id: 'platformSkill.submitPublish' })}
            </Button>
          </Space>
        </Form>
      </Drawer>
    </section>
  );
}
