import { PlusOutlined, ReloadOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Table, Typography, message, Tag, Space, Popconfirm, Modal, Form, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import {
  listModelConfigs,
  deleteModelConfig,
  testModel,
  activateModel,
  deactivateModel,
  setDefaultModel,
  createModelConfig,
  getSupportedProviders,
} from '@/services/modelConfigService';
import type { ModelConfig, ModelProvider, ModelTaskType, ProviderInfo } from '@/types/modelConfig';

const MODELS_QUERY_KEY = ['model-configs'] as const;
const PROVIDERS_QUERY_KEY = ['model-providers-list'] as const;

const STATUS_COLORS: Record<string, string> = {
  inactive: 'default',
  active: 'success',
  disabled: 'warning',
};

const PROVIDER_COLORS: Record<string, string> = {
  DEEPSEEK: 'blue',
  OPENAI: 'green',
  DASHSCOPE: 'purple',
  OLLAMA: 'orange',
  CUSTOM: 'default',
};

export default function ModelConfigManager() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: pageData, isLoading, isError, refetch } = useQuery({
    queryKey: MODELS_QUERY_KEY,
    queryFn: () => listModelConfigs({ page: 1, size: 50 }),
  });

  const { data: providers = [] } = useQuery({
    queryKey: PROVIDERS_QUERY_KEY,
    queryFn: getSupportedProviders,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: MODELS_QUERY_KEY });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteModelConfig,
    onSuccess: () => {
      message.success('Deleted successfully');
      invalidate();
    },
    onError: (err: Error) => {
      message.error(err.message);
      invalidate();
    },
  });

  // Test mutation
  const testMutation = useMutation({
    mutationFn: testModel,
    onSuccess: (result) => {
      if (result.success) {
        message.success(`Test passed! Latency: ${result.latencyMs}ms, Tokens: ${result.tokensUsed}`);
      } else {
        message.error(`Test failed: ${result.errorMsg}`);
      }
      invalidate();
    },
    onError: (err: Error) => {
      message.error(err.message);
    },
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: activateModel,
    onSuccess: () => {
      message.success('Model activated');
      invalidate();
    },
    onError: (err: Error) => {
      message.error(err.message);
    },
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: deactivateModel,
    onSuccess: () => {
      message.success('Model deactivated');
      invalidate();
    },
    onError: (err: Error) => {
      message.error(err.message);
    },
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: setDefaultModel,
    onSuccess: () => {
      message.success('Default model set');
      invalidate();
    },
    onError: (err: Error) => {
      message.error(err.message);
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createModelConfig,
    onSuccess: () => {
      message.success('Model created');
      setModalVisible(false);
      form.resetFields();
      invalidate();
    },
    onError: (err: Error) => {
      message.error(err.message);
    },
  });

  const handleCreate = () => {
    form.validateFields().then((values) => {
      createMutation.mutate(values);
    });
  };

  const handleProviderChange = (provider: ModelProvider) => {
    const selected = providers.find((p) => p.name === provider);
    if (selected?.defaultBaseUrl) {
      form.setFieldsValue({ baseUrl: selected.defaultBaseUrl });
    }
  };

  const columns: ColumnsType<ModelConfig> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <span>{name}</span>
          {record.isDefault && <Tag color="gold">Default</Tag>}
        </Space>
      ),
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider: string) => (
        <Tag color={PROVIDER_COLORS[provider] || 'default'}>{provider}</Tag>
      ),
    },
    {
      title: 'Model',
      dataIndex: 'modelName',
      key: 'modelName',
    },
    {
      title: 'Task Types',
      dataIndex: 'taskTypes',
      key: 'taskTypes',
      render: (types: ModelTaskType[]) => (
        <Space wrap>
          {types?.map((t) => <Tag key={t}>{t}</Tag>)}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Test',
      key: 'test',
      width: 100,
      render: (_, record) => record.testPassed ? (
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
      ) : (
        <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => testMutation.mutate(record.id)}
            loading={testMutation.isPending && testMutation.variables === record.id}
          >
            Test
          </Button>
          {record.status === 'active' ? (
            <Button
              size="small"
              danger
              onClick={() => deactivateMutation.mutate(record.id)}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              size="small"
              type="primary"
              onClick={() => activateMutation.mutate(record.id)}
            >
              Activate
            </Button>
          )}
          {!record.isDefault && record.status === 'active' && (
            <Button
              size="small"
              icon={<StarOutlined />}
              onClick={() => setDefaultMutation.mutate(record.id)}
            />
          )}
          <Popconfirm
            title="Delete this model?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section style={{ padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Typography.Title level={3}>AI Model Management</Typography.Title>
          <Typography.Paragraph type="secondary">
            Configure and manage LLM models for different task types
          </Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} loading={isLoading} onClick={() => void refetch()}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            Add Model
          </Button>
        </Space>
      </header>

      {isError && (
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="danger">Failed to load models</Typography.Text>
          <Button size="small" onClick={() => void refetch()} style={{ marginLeft: 8 }}>
            Retry
          </Button>
        </div>
      )}

      <Table<ModelConfig>
        rowKey="id"
        columns={columns}
        dataSource={pageData?.records || []}
        loading={isLoading}
        pagination={{
          total: pageData?.total || 0,
          pageSize: pageData?.size || 20,
          current: pageData?.page || 1,
        }}
      />

      <Modal
        title="Add Model"
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => setModalVisible(false)}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., DeepSeek V3" />
          </Form.Item>
          <Form.Item name="provider" label="Provider" rules={[{ required: true }]}>
            <Select onChange={handleProviderChange}>
              {providers.map((p: ProviderInfo) => (
                <Select.Option key={p.name} value={p.name}>
                  {p.displayName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="modelName" label="Model Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., deepseek-chat" />
          </Form.Item>
          <Form.Item name="apiKey" label="API Key">
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item name="baseUrl" label="Base URL">
            <Input placeholder="https://api.deepseek.com" />
          </Form.Item>
          <Form.Item name="taskTypes" label="Task Types" rules={[{ required: true }]}>
            <Select mode="multiple">
              <Select.Option value="AGENT_REASONING">Agent Reasoning</Select.Option>
              <Select.Option value="INTENT_ROUTING">Intent Routing</Select.Option>
              <Select.Option value="EMBEDDING">Embedding</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
