import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import { Alert, Button, InputNumber, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import PlatformAdminSettingsDrawer from '@/components/platformAdmin/PlatformAdminSettingsDrawer';
import styles from '@/components/platformAdmin/platformScreen.less';
import { usePlatformAdminConfig } from '@/hooks/usePlatformAdminConfig';
import { clampUncoveredIntentLimit, listUncoveredIntents } from '@/services/platformUncoveredIntentService';
import type { PlatformUncoveredIntentItem } from '@/types/platformUncoveredIntent';

const UNCOVERED_QUERY_KEY = ['uncovered-intents'] as const;

export default function UncoveredIntentScreen() {
  const intl = useIntl();
  const admin = usePlatformAdminConfig();
  const [limit, setLimit] = useState(20);

  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: [...UNCOVERED_QUERY_KEY, admin.tenantId, limit],
    queryFn: () => listUncoveredIntents(limit),
  });

  const columns: ColumnsType<PlatformUncoveredIntentItem> = [
    {
      title: intl.formatMessage({ id: 'platformUncovered.col.query' }),
      dataIndex: 'userQuery',
      render: (text: string) => <div className={styles.descCell}>{text}</div>,
    },
    {
      title: intl.formatMessage({ id: 'platformUncovered.col.conversation' }),
      dataIndex: 'conversationId',
      width: 180,
    },
    {
      title: intl.formatMessage({ id: 'platformUncovered.col.time' }),
      dataIndex: 'createdAt',
      width: 200,
      render: (value: string) => new Date(value).toLocaleString(),
    },
  ];

  return (
    <section className={`${styles.screen} nebula-uncovered-intent-screen`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Typography.Title level={3} className={styles.title}>
            {intl.formatMessage({ id: 'platformUncovered.title' })}
          </Typography.Title>
          <Typography.Paragraph className={styles.subtitle}>
            {intl.formatMessage({ id: 'platformUncovered.subtitle' })}
          </Typography.Paragraph>
        </div>
        <div className={styles.toolbar}>
          <Button icon={<SettingOutlined />} onClick={() => admin.setConfigOpen(true)}>
            {intl.formatMessage({ id: 'platformSkill.config' })}
          </Button>
          <Space size="middle">
            <span>{intl.formatMessage({ id: 'platformUncovered.limit' })}</span>
            <InputNumber
              min={1}
              max={100}
              value={limit}
              onChange={(value) => setLimit(clampUncoveredIntentLimit(Number(value ?? 20)))}
            />
          </Space>
          <Button icon={<ReloadOutlined />} loading={isLoading} onClick={() => void refetch()}>
            {intl.formatMessage({ id: 'agentHub.refresh' })}
          </Button>
        </div>
      </header>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message={intl.formatMessage({ id: 'platformUncovered.loadFailed' })}
          action={
            <Button size="small" onClick={() => void refetch()}>
              {intl.formatMessage({ id: 'agentHub.retry' })}
            </Button>
          }
        />
      ) : null}

      <div className={styles.tableCard}>
        <Table<PlatformUncoveredIntentItem>
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={isLoading}
          pagination={false}
          locale={{
            emptyText: intl.formatMessage({ id: 'platformUncovered.empty' }),
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
    </section>
  );
}
