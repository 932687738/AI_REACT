import {
  HeartOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import PlatformAdminSettingsDrawer from '@/components/platformAdmin/PlatformAdminSettingsDrawer';
import styles from '@/components/platformAdmin/platformScreen.less';
import { usePlatformAdminConfig } from '@/hooks/usePlatformAdminConfig';
import {
  listPlatformAgents,
  probePlatformAgentHealth,
  registerPlatformAgent,
  updateAgentVariables,
} from '@/services/platformAgentRegistryService';
import type {
  AgentAppVariable,
  PlatformAgentRegistryItem,
  RegisterPlatformAgentInput,
} from '@/types/platformAgentRegistry';
import { AGENT_VARIABLE_NAME_PATTERN } from '@/types/platformAgentRegistry';
import {
  getPlatformErrorMessage,
  handlePlatformUnauthorized,
} from '@/utils/platformUnauthorized';

const AGENTS_QUERY_KEY = ['platform-agents'] as const;

const STATUS_COLORS: Record<string, string> = {
  active: 'success',
  unhealthy: 'error',
  deprecated: 'warning',
};

function normalizeAgentStatus(raw: string): string {
  return raw?.toLowerCase() || 'unknown';
}

export default function PlatformAgentRegistryManager() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const admin = usePlatformAdminConfig();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<PlatformAgentRegistryItem | null>(null);
  const [probingName, setProbingName] = useState<string | null>(null);
  const [registerForm] = Form.useForm<RegisterPlatformAgentInput>();
  const [variablesForm] = Form.useForm<{ variables: AgentAppVariable[] }>();

  const { data: agents = [], isLoading, isError, refetch } = useQuery({
    queryKey: [...AGENTS_QUERY_KEY, admin.tenantId],
    queryFn: listPlatformAgents,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
  };

  const registerMutation = useMutation({
    mutationFn: registerPlatformAgent,
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'platformAgent.registerSuccess' }));
      setRegisterOpen(false);
      registerForm.resetFields();
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
        getPlatformErrorMessage(err, intl.formatMessage({ id: 'platformAgent.registerFailed' })),
      );
    },
  });

  const probeMutation = useMutation({
    mutationFn: probePlatformAgentHealth,
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'platformAgent.probeSuccess' }));
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
        getPlatformErrorMessage(err, intl.formatMessage({ id: 'platformAgent.probeFailed' })),
      );
    },
    onSettled: () => setProbingName(null),
  });

  const variablesMutation = useMutation({
    mutationFn: ({ name, variables }: { name: string; variables: AgentAppVariable[] }) =>
      updateAgentVariables(name, { variables }),
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'platformAgent.variablesSaveSuccess' }));
      setVariablesOpen(false);
      setEditingAgent(null);
      variablesForm.resetFields();
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
        getPlatformErrorMessage(
          err,
          intl.formatMessage({ id: 'platformAgent.variablesSaveFailed' }),
        ),
      );
    },
  });

  const openVariablesDrawer = (agent: PlatformAgentRegistryItem) => {
    setEditingAgent(agent);
    variablesForm.setFieldsValue({ variables: agent.variables ?? [] });
    setVariablesOpen(true);
  };

  const columns: ColumnsType<PlatformAgentRegistryItem> = [
    {
      title: intl.formatMessage({ id: 'platformAgent.col.name' }),
      key: 'name',
      render: (_, row) => (
        <div className={styles.nameCell}>
          <strong>{row.displayName || row.name}</strong>
          <span>
            {row.name} · v{row.version}
          </span>
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'platformAgent.col.status' }),
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const normalized = normalizeAgentStatus(status);
        return (
          <Tag color={STATUS_COLORS[normalized] ?? 'default'}>{normalized}</Tag>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'platformAgent.col.actions' }),
      key: 'actions',
      width: 220,
      render: (_, row) => (
        <Space size="small">
          <Button size="small" icon={<FormOutlined />} onClick={() => openVariablesDrawer(row)}>
            {intl.formatMessage({ id: 'platformAgent.variables' })}
          </Button>
          <Button
            size="small"
            icon={<HeartOutlined />}
            loading={probingName === row.name && probeMutation.isPending}
            onClick={() => {
              setProbingName(row.name);
              probeMutation.mutate(row.name);
            }}
          >
            {intl.formatMessage({ id: 'platformAgent.probe' })}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <section className={`${styles.screen} nebula-platform-agent-screen`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Typography.Title level={3} className={styles.title}>
            {intl.formatMessage({ id: 'platformAgent.title' })}
          </Typography.Title>
          <Typography.Paragraph className={styles.subtitle}>
            {intl.formatMessage({ id: 'platformAgent.subtitle' })}
          </Typography.Paragraph>
        </div>
        <div className={styles.toolbar}>
          <Button icon={<SettingOutlined />} onClick={() => admin.setConfigOpen(true)}>
            {intl.formatMessage({ id: 'platformSkill.config' })}
          </Button>
          <Button icon={<ReloadOutlined />} loading={isLoading} onClick={() => void refetch()}>
            {intl.formatMessage({ id: 'agentHub.refresh' })}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegisterOpen(true)}>
            {intl.formatMessage({ id: 'platformAgent.register' })}
          </Button>
        </div>
      </header>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message={intl.formatMessage({ id: 'platformAgent.loadFailed' })}
          action={
            <Button size="small" onClick={() => void refetch()}>
              {intl.formatMessage({ id: 'agentHub.retry' })}
            </Button>
          }
        />
      ) : null}

      <div className={styles.tableCard}>
        <Table<PlatformAgentRegistryItem>
          rowKey="name"
          columns={columns}
          dataSource={agents}
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{
            emptyText: intl.formatMessage({ id: 'platformAgent.empty' }),
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
        title={intl.formatMessage({ id: 'platformAgent.registerTitle' })}
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        width={Math.min(560, typeof window !== 'undefined' ? window.innerWidth - 24 : 560)}
        destroyOnClose
      >
        <Form
          form={registerForm}
          layout="vertical"
          onFinish={(values) => {
            registerMutation.mutate({
              ...values,
              permissionTags: values.permissionTags ?? [],
            });
          }}
        >
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'platformAgent.field.name' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'platformAgent.field.required' }) }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="displayName" label={intl.formatMessage({ id: 'platformAgent.field.displayName' })}>
            <Input />
          </Form.Item>
          <Form.Item
            name="capabilityDescription"
            label={intl.formatMessage({ id: 'platformAgent.field.capability' })}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="beanName"
            label={intl.formatMessage({ id: 'platformAgent.field.beanName' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'platformAgent.field.required' }) }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="healthCheckUrl" label={intl.formatMessage({ id: 'platformAgent.field.healthUrl' })}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="permissionTags" label={intl.formatMessage({ id: 'platformAgent.field.tags' })}>
            <Select mode="tags" tokenSeparators={[',']} placeholder="tenant:default" />
          </Form.Item>
          <Space>
            <Button onClick={() => setRegisterOpen(false)}>
              {intl.formatMessage({ id: 'platformSkill.cancel' })}
            </Button>
            <Button type="primary" htmlType="submit" loading={registerMutation.isPending}>
              {intl.formatMessage({ id: 'platformAgent.submitRegister' })}
            </Button>
          </Space>
        </Form>
      </Drawer>

      <Drawer
        title={intl.formatMessage(
          { id: 'platformAgent.variablesTitle' },
          { name: editingAgent?.displayName || editingAgent?.name || '' },
        )}
        open={variablesOpen}
        onClose={() => {
          setVariablesOpen(false);
          setEditingAgent(null);
        }}
        width={Math.min(640, typeof window !== 'undefined' ? window.innerWidth - 24 : 640)}
        destroyOnClose
      >
        <Form
          form={variablesForm}
          layout="vertical"
          onFinish={(values) => {
            if (!editingAgent) {
              return;
            }
            variablesMutation.mutate({
              name: editingAgent.name,
              variables: (values.variables ?? []).map((item) => ({
                ...item,
                type: item.type ?? 'STRING',
                required: Boolean(item.required),
                defaultValue: item.defaultValue ?? '',
                description: item.description ?? '',
              })),
            });
          }}
        >
          <Form.List name="variables">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="start" style={{ display: 'flex', marginBottom: 12 }} wrap>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label={intl.formatMessage({ id: 'platformAgent.variable.name' })}
                      rules={[
                        { required: true, message: intl.formatMessage({ id: 'platformAgent.field.required' }) },
                        {
                          pattern: AGENT_VARIABLE_NAME_PATTERN,
                          message: intl.formatMessage({ id: 'platformAgent.variable.nameInvalid' }),
                        },
                      ]}
                    >
                      <Input placeholder="user_name" style={{ width: 140 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      label={intl.formatMessage({ id: 'platformAgent.variable.type' })}
                      initialValue="STRING"
                    >
                      <Select
                        style={{ width: 120 }}
                        options={[
                          { value: 'STRING', label: 'STRING' },
                          { value: 'NUMBER', label: 'NUMBER' },
                          { value: 'BOOLEAN', label: 'BOOLEAN' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'defaultValue']}
                      label={intl.formatMessage({ id: 'platformAgent.variable.default' })}
                    >
                      <Input style={{ width: 140 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label={intl.formatMessage({ id: 'platformAgent.variable.description' })}
                    >
                      <Input style={{ width: 160 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'required']}
                      label={intl.formatMessage({ id: 'platformAgent.variable.required' })}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>
                      {intl.formatMessage({ id: 'platformAgent.variable.remove' })}
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add({ type: 'STRING', required: false })} block>
                  {intl.formatMessage({ id: 'platformAgent.variable.add' })}
                </Button>
              </>
            )}
          </Form.List>
          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => setVariablesOpen(false)}>
              {intl.formatMessage({ id: 'platformSkill.cancel' })}
            </Button>
            <Button type="primary" htmlType="submit" loading={variablesMutation.isPending}>
              {intl.formatMessage({ id: 'platformAgent.variablesSave' })}
            </Button>
          </Space>
        </Form>
      </Drawer>
    </section>
  );
}
