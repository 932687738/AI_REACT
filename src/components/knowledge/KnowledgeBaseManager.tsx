import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import { Button, Form, Input, Modal, Space, Table, Typography, message } from 'antd';
import { useState } from 'react';
import {
  createKnowledgeBase,
  deleteKnowledgeBase,
  listKnowledgeBases,
  updateKnowledgeBase,
} from '@/services/knowledgeService';
import type { KnowledgeBase, KnowledgeBaseInput } from '@/openapi/typings';
import styles from './knowledgeScreen.less';

const KNOWLEDGE_BASES_KEY = ['knowledge-bases'] as const;

export default function KnowledgeBaseManager() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<KnowledgeBaseInput>();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: KNOWLEDGE_BASES_KEY,
    queryFn: listKnowledgeBases,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: KNOWLEDGE_BASES_KEY });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: KnowledgeBaseInput) => {
      if (editingId) {
        return updateKnowledgeBase(editingId, values);
      }
      return createKnowledgeBase(values);
    },
    onSuccess: () => {
      message.success(
        intl.formatMessage({
          id: editingId ? 'knowledge.kb.saveUpdated' : 'knowledge.kb.saveCreated',
        }),
      );
      form.resetFields();
      setEditingId(null);
      invalidate();
    },
    onError: () => {
      message.error(intl.formatMessage({ id: 'knowledge.kb.saveFailed' }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKnowledgeBase(id),
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'knowledge.kb.deleteSuccess' }));
      invalidate();
    },
    onError: () => {
      message.error(intl.formatMessage({ id: 'knowledge.kb.deleteFailed' }));
    },
  });

  const startEdit = (item: KnowledgeBase) => {
    setEditingId(item.id);
    form.setFieldsValue({
      name: item.name,
      description: item.description || '',
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'knowledge.kb.deleteConfirmTitle' }),
      content: intl.formatMessage({ id: 'knowledge.kb.deleteConfirm' }),
      okText: intl.formatMessage({ id: 'knowledge.kb.delete' }),
      cancelText: intl.formatMessage({ id: 'knowledge.kb.cancel' }),
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <Typography.Title level={3} className={styles.title}>
          {intl.formatMessage({ id: 'knowledge.kb.title' })}
        </Typography.Title>
        <Typography.Paragraph className={styles.subtitle}>
          {intl.formatMessage({ id: 'knowledge.kb.subtitle' })}
        </Typography.Paragraph>
      </header>

      <Form
        form={form}
        layout="vertical"
        className={styles.formCard}
        onFinish={(values) => saveMutation.mutate(values)}
      >
        <Form.Item
          name="name"
          label={intl.formatMessage({ id: 'knowledge.kb.nameLabel' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'knowledge.kb.nameRequired' }),
            },
          ]}
        >
          <Input placeholder={intl.formatMessage({ id: 'knowledge.kb.namePlaceholder' })} />
        </Form.Item>
        <Form.Item
          name="description"
          label={intl.formatMessage({ id: 'knowledge.kb.descLabel' })}
        >
          <Input placeholder={intl.formatMessage({ id: 'knowledge.kb.descPlaceholder' })} />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
            {intl.formatMessage({
              id: editingId ? 'knowledge.kb.update' : 'knowledge.kb.create',
            })}
          </Button>
          {editingId ? (
            <Button
              onClick={() => {
                setEditingId(null);
                form.resetFields();
              }}
            >
              {intl.formatMessage({ id: 'knowledge.kb.cancel' })}
            </Button>
          ) : null}
        </Space>
      </Form>

      <div className={styles.tableCard}>
        <Table<KnowledgeBase>
          rowKey="id"
          loading={isLoading}
          dataSource={items}
          pagination={false}
          locale={{
            emptyText: intl.formatMessage({ id: 'knowledge.kb.empty' }),
          }}
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              width: 120,
              ellipsis: true,
            },
            {
              title: intl.formatMessage({ id: 'knowledge.kb.nameCol' }),
              dataIndex: 'name',
            },
            {
              title: intl.formatMessage({ id: 'knowledge.kb.descCol' }),
              dataIndex: 'description',
              ellipsis: true,
            },
            {
              title: intl.formatMessage({ id: 'knowledge.kb.actionsCol' }),
              width: 160,
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    aria-label={intl.formatMessage({ id: 'knowledge.kb.edit' })}
                    onClick={() => startEdit(record)}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={intl.formatMessage({ id: 'knowledge.kb.delete' })}
                    onClick={() => handleDelete(record.id)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
