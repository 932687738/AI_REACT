import { Form, Input, Modal, Switch, Typography } from 'antd';
import { useIntl } from '@umijs/max';
import { useEffect } from 'react';
import type { AgentAppVariable } from '@/types/platformAgentRegistry';
import { AGENT_VARIABLE_MAX_VALUE_LENGTH } from '@/types/platformAgentRegistry';
import { mergeVariableDefaults } from '@/utils/agentSessionVariables';

export interface ChatVariableFormValues {
  [key: string]: string;
}

interface ChatVariableFormModalProps {
  open: boolean;
  agentDisplayName: string;
  variables: AgentAppVariable[];
  initialValues?: Record<string, string>;
  onCancel: () => void;
  onSubmit: (values: Record<string, string>) => void;
}

export default function ChatVariableFormModal({
  open,
  agentDisplayName,
  variables,
  initialValues,
  onCancel,
  onSubmit,
}: ChatVariableFormModalProps) {
  const intl = useIntl();
  const [form] = Form.useForm<ChatVariableFormValues>();

  useEffect(() => {
    if (!open) {
      return;
    }
    form.setFieldsValue(mergeVariableDefaults(variables, initialValues ?? {}));
  }, [open, variables, initialValues, form]);

  return (
    <Modal
      open={open}
      title={intl.formatMessage({ id: 'chat.variables.modalTitle' }, { agent: agentDisplayName })}
      okText={intl.formatMessage({ id: 'chat.variables.submit' })}
      cancelText={intl.formatMessage({ id: 'platformSkill.cancel' })}
      destroyOnClose
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => onSubmit(values))
          .catch(() => undefined);
      }}
    >
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {intl.formatMessage({ id: 'chat.variables.modalHint' })}
      </Typography.Paragraph>
      <Form form={form} layout="vertical">
        {variables.map((variable) => (
          <Form.Item
            key={variable.name}
            name={variable.name}
            label={
              <span>
                {variable.description || variable.name}
                {variable.required ? (
                  <Typography.Text type="danger"> *</Typography.Text>
                ) : null}
              </span>
            }
            rules={[
              {
                required: variable.required,
                message: intl.formatMessage({ id: 'chat.variables.required' }),
              },
              {
                max: AGENT_VARIABLE_MAX_VALUE_LENGTH,
                message: intl.formatMessage(
                  { id: 'chat.variables.tooLong' },
                  { max: AGENT_VARIABLE_MAX_VALUE_LENGTH },
                ),
              },
            ]}
            extra={
              variable.defaultValue
                ? intl.formatMessage(
                    { id: 'chat.variables.defaultHint' },
                    { value: variable.defaultValue },
                  )
                : undefined
            }
          >
            {variable.type === 'BOOLEAN' ? (
              <Switch
                checked={form.getFieldValue(variable.name) === 'true'}
                onChange={(checked) => form.setFieldValue(variable.name, checked ? 'true' : 'false')}
              />
            ) : (
              <Input maxLength={AGENT_VARIABLE_MAX_VALUE_LENGTH} />
            )}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
