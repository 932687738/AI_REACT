import { useCallback, useEffect, useState } from 'react';
import { useIntl } from '@umijs/max';
import { Button, Card, Drawer, Empty, Form, Input, message, Popconfirm, Space, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  listQuickCommands,
  createQuickCommand,
  updateQuickCommand,
  deleteQuickCommand,
} from '@/services/promptMarketplaceService';
import type { QuickCommand } from '@/types/promptMarketplace';

const { TextArea } = Input;

interface QuickCommandsPageProps {
  open: boolean;
  onClose: () => void;
  agentName: string;
}

export default function QuickCommandsPage({ open, onClose, agentName }: QuickCommandsPageProps) {
  const intl = useIntl();
  const [commands, setCommands] = useState<QuickCommand[]>([]);
  const [loading, setLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<QuickCommand | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchCommands = useCallback(async () => {
    if (!agentName) return;
    setLoading(true);
    try {
      const items = await listQuickCommands(agentName);
      setCommands(items);
    } finally {
      setLoading(false);
    }
  }, [agentName]);

  useEffect(() => {
    if (open && agentName) {
      void fetchCommands();
    }
  }, [open, agentName, fetchCommands]);

  const handleCreate = () => {
    setEditTarget(null);
    form.resetFields();
    setFormOpen(true);
  };

  const handleEdit = (cmd: QuickCommand) => {
    setEditTarget(cmd);
    form.setFieldsValue({ name: cmd.name, content: cmd.content, icon: cmd.icon });
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editTarget) {
        await updateQuickCommand(agentName, editTarget.id, values);
        message.success('指令已更新');
      } else {
        await createQuickCommand(agentName, values);
        message.success('指令已创建');
      }
      setFormOpen(false);
      void fetchCommands();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteQuickCommand(agentName, id);
      message.success('指令已删除');
      void fetchCommands();
    } catch {
      message.error('删除失败');
    }
  };

  return (
    <Drawer
      title={intl.formatMessage({ id: 'quickCommands.title', defaultMessage: '快捷指令管理' })}
      width={560}
      open={open}
      onClose={onClose}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建指令
        </Button>
        <Spin spinning={loading}>
          {commands.length === 0 ? (
            <Empty description="暂无快捷指令" />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {commands.map((cmd) => (
                <Card key={cmd.id} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{cmd.icon ? `${cmd.icon} ` : ''}{cmd.name}</strong>
                      <p style={{ margin: '4px 0 0', color: '#666', fontSize: 13 }}>
                        {cmd.content.length > 80 ? cmd.content.slice(0, 80) + '...' : cmd.content}
                      </p>
                    </div>
                    <Space>
                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(cmd)} />
                      <Popconfirm title="确认删除？" onConfirm={() => void handleDelete(cmd.id)}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>
                </Card>
              ))}
            </Space>
          )}
        </Spin>
      </Space>

      <Drawer
        title={editTarget ? '编辑指令' : '新建指令'}
        width={400}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="指令名称" rules={[{ required: true }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="content" label="Prompt 内容" rules={[{ required: true }]}>
            <TextArea rows={6} maxLength={4000} />
          </Form.Item>
          <Form.Item name="icon" label="图标（可选）">
            <Input maxLength={64} placeholder="如 🚀 ⚡ 📝" />
          </Form.Item>
          <Button type="primary" onClick={() => void handleSave()}>
            保存
          </Button>
        </Form>
      </Drawer>
    </Drawer>
  );
}
