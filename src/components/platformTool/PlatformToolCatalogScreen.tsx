import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import { Alert, Button, Input, Select, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import PlatformAdminSettingsDrawer from '@/components/platformAdmin/PlatformAdminSettingsDrawer';
import styles from '@/components/platformAdmin/platformScreen.less';
import { usePlatformAdminConfig } from '@/hooks/usePlatformAdminConfig';
import { listPlatformToolSummaries } from '@/services/platformToolCatalogService';
import type { PlatformToolSourceFilter, PlatformToolSummaryItem } from '@/types/platformToolCatalog';
import { filterPlatformTools } from '@/utils/platformToolCatalog';

const TOOLS_QUERY_KEY = ['platform-tools'] as const;

const SOURCE_COLORS: Record<string, string> = {
  'agent-hub': 'blue',
  mcp: 'purple',
};

export default function PlatformToolCatalogScreen() {
  const intl = useIntl();
  const admin = usePlatformAdminConfig();
  const [keyword, setKeyword] = useState('');
  const [sourceFilter, setSourceFilter] = useState<PlatformToolSourceFilter>('all');

  const { data: tools = [], isLoading, isError, refetch } = useQuery({
    queryKey: [...TOOLS_QUERY_KEY, admin.tenantId],
    queryFn: listPlatformToolSummaries,
  });

  const filtered = useMemo(
    () => filterPlatformTools(tools, keyword, sourceFilter),
    [tools, keyword, sourceFilter],
  );

  const columns: ColumnsType<PlatformToolSummaryItem> = [
    {
      title: intl.formatMessage({ id: 'platformTool.col.source' }),
      dataIndex: 'source',
      width: 120,
      render: (source: string) => (
        <Tag color={SOURCE_COLORS[source] ?? 'default'}>{source}</Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'platformTool.col.name' }),
      dataIndex: 'name',
      width: 220,
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: intl.formatMessage({ id: 'platformTool.col.summary' }),
      dataIndex: 'summary',
      render: (text: string) => <div className={styles.descCell}>{text}</div>,
    },
  ];

  return (
    <section className={`${styles.screen} nebula-platform-tool-screen`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Typography.Title level={3} className={styles.title}>
            {intl.formatMessage({ id: 'platformTool.title' })}
          </Typography.Title>
          <Typography.Paragraph className={styles.subtitle}>
            {intl.formatMessage({ id: 'platformTool.subtitle' })}
          </Typography.Paragraph>
        </div>
        <div className={styles.toolbar}>
          <Button icon={<SettingOutlined />} onClick={() => admin.setConfigOpen(true)}>
            {intl.formatMessage({ id: 'platformSkill.config' })}
          </Button>
          <Button icon={<ReloadOutlined />} loading={isLoading} onClick={() => void refetch()}>
            {intl.formatMessage({ id: 'agentHub.refresh' })}
          </Button>
        </div>
      </header>

      <div className={styles.filters}>
        <Input
          className={styles.filterSearch}
          allowClear
          placeholder={intl.formatMessage({ id: 'platformTool.searchPlaceholder' })}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Select<PlatformToolSourceFilter>
          value={sourceFilter}
          style={{ minWidth: 160 }}
          onChange={setSourceFilter}
          options={[
            { value: 'all', label: intl.formatMessage({ id: 'platformTool.filter.all' }) },
            { value: 'agent-hub', label: intl.formatMessage({ id: 'platformTool.filter.agentHub' }) },
            { value: 'mcp', label: intl.formatMessage({ id: 'platformTool.filter.mcp' }) },
          ]}
        />
      </div>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message={intl.formatMessage({ id: 'platformTool.loadFailed' })}
          action={
            <Button size="small" onClick={() => void refetch()}>
              {intl.formatMessage({ id: 'agentHub.retry' })}
            </Button>
          }
        />
      ) : null}

      <div className={styles.tableCard}>
        <Table<PlatformToolSummaryItem>
          rowKey={(row) => `${row.source}-${row.name}`}
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          locale={{
            emptyText: intl.formatMessage({ id: 'platformTool.empty' }),
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
