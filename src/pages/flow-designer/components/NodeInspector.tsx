import { useEffect } from 'react';
import { Divider, Form, Input, InputNumber, Select, Typography } from 'antd';
import type { Node } from '@xyflow/react';
import type { FlowNodeRetryConfig } from '@/types/flowManagement';
import type { FlowDesignerNodeData } from '../utils/flowDslMapper';
import styles from './NodeInspector.less';

interface NodeInspectorProps {
  node: Node<FlowDesignerNodeData> | null;
  readonly: boolean;
  onChange: (nodeId: string, config: Record<string, unknown>, label?: string) => void;
}

export default function NodeInspector({ node, readonly, onChange }: NodeInspectorProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!node) {
      form.resetFields();
      return;
    }
    const retry = node.data.config.retry as FlowNodeRetryConfig | undefined;
    form.setFieldsValue({
      label: node.data.label,
      ...node.data.config,
      retryMaxAttempts: retry?.maxAttempts,
      retryBackoffMs: retry?.backoffMs,
    });
  }, [form, node]);

  if (!node) {
    return (
      <aside className={styles.inspector}>
        <Typography.Text type="secondary">选中画布上的节点以编辑配置</Typography.Text>
      </aside>
    );
  }

  const flowType = node.data.flowType;

  const emitChange = () => {
    const values = form.getFieldsValue();
    const config: Record<string, unknown> = { ...node.data.config };
    const label = values.label as string | undefined;

    if (values.retryMaxAttempts !== undefined || values.retryBackoffMs !== undefined) {
      config.retry = {
        maxAttempts: values.retryMaxAttempts,
        backoffMs: values.retryBackoffMs,
      };
    }

    switch (flowType) {
      case 'ai':
        config.systemPrompt = values.systemPrompt;
        config.userPromptTemplate = values.userPromptTemplate;
        break;
      case 'knowledge':
        config.knowledgeBaseId = values.knowledgeBaseId;
        config.queryTemplate = values.queryTemplate;
        break;
      case 'classifier':
        config.categories = values.categories;
        config.inputTemplate = values.inputTemplate;
        break;
      case 'branch':
        config.expression = values.expression;
        break;
      case 'script':
        config.script = values.script;
        config.timeoutSeconds = values.timeoutSeconds;
        break;
      case 'http':
        config.url = values.url;
        config.method = values.method;
        config.bodyTemplate = values.bodyTemplate;
        break;
      case 'subflow':
        config.subflowId = values.subflowId;
        break;
      case 'reply':
        config.messageTemplate = values.messageTemplate;
        break;
      default:
        break;
    }

    onChange(node.id, config, label);
  };

  const showRetry = ['ai', 'http', 'knowledge'].includes(flowType);

  return (
    <aside className={styles.inspector}>
      <Typography.Text strong className={styles.title}>
        节点配置
      </Typography.Text>
      <Typography.Text type="secondary" className={styles.meta}>
        {flowType} · {node.id}
      </Typography.Text>

      <Form
        form={form}
        layout="vertical"
        size="small"
        disabled={readonly}
        onValuesChange={() => emitChange()}
      >
        <Form.Item name="label" label="显示名称">
          <Input />
        </Form.Item>

        {flowType === 'ai' && (
          <>
            <Form.Item name="systemPrompt" label="System Prompt">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="userPromptTemplate" label="User 模板">
              <Input.TextArea rows={2} placeholder="{{question}}" />
            </Form.Item>
          </>
        )}

        {flowType === 'knowledge' && (
          <>
            <Form.Item name="knowledgeBaseId" label="知识库 ID">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="queryTemplate" label="查询模板">
              <Input placeholder="{{question}}" />
            </Form.Item>
          </>
        )}

        {flowType === 'classifier' && (
          <>
            <Form.Item name="categories" label="类别列表">
              <Input placeholder="general,support" />
            </Form.Item>
            <Form.Item name="inputTemplate" label="输入模板">
              <Input placeholder="{{question}}" />
            </Form.Item>
          </>
        )}

        {flowType === 'branch' && (
          <Form.Item name="expression" label="条件表达式">
            <Input placeholder="true / {{var}}" />
          </Form.Item>
        )}

        {flowType === 'script' && (
          <>
            <Form.Item name="script" label="Groovy 脚本">
              <Input.TextArea rows={5} />
            </Form.Item>
            <Form.Item name="timeoutSeconds" label="超时（秒）">
              <InputNumber min={1} max={120} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}

        {flowType === 'http' && (
          <>
            <Form.Item name="url" label="URL">
              <Input />
            </Form.Item>
            <Form.Item name="method" label="Method">
              <Select
                options={[
                  { label: 'GET', value: 'GET' },
                  { label: 'POST', value: 'POST' },
                  { label: 'PUT', value: 'PUT' },
                ]}
              />
            </Form.Item>
            <Form.Item name="bodyTemplate" label="Body 模板">
              <Input.TextArea rows={3} />
            </Form.Item>
          </>
        )}

        {flowType === 'subflow' && (
          <Form.Item name="subflowId" label="子流程 ID">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        )}

        {flowType === 'reply' && (
          <Form.Item name="messageTemplate" label="回复模板">
            <Input.TextArea rows={3} placeholder="{{ai_1.text}}" />
          </Form.Item>
        )}

        {showRetry && (
          <>
            <Divider plain>重试策略</Divider>
            <Form.Item name="retryMaxAttempts" label="最大次数">
              <InputNumber min={1} max={5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="retryBackoffMs" label="退避（ms）">
              <InputNumber min={0} step={500} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}
      </Form>
    </aside>
  );
}
