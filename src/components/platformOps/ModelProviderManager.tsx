import { ReloadOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import { Alert, Button, Switch, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PlatformAdminSettingsDrawer from '@/components/platformAdmin/PlatformAdminSettingsDrawer';
import styles from '@/components/platformAdmin/platformScreen.less';
import { usePlatformAdminConfig } from '@/hooks/usePlatformAdminConfig';
import {
  listModelProviders,
  refreshModelProviders,
  setModelProviderEnabled,
} from '@/services/platformModelProviderService';
import type { PlatformModelProviderState } from '@/types/platformModelProvider';
import {
  getPlatformErrorMessage,
  handlePlatformUnauthorized,
} from '@/utils/platformUnauthorized';

const PROVIDERS_QUERY_KEY = ['model-providers'] as const;

function providerLabelId(providerId: string): string {
  return `platformModelProvider.label.${providerId}`;
}

export default function ModelProviderManager() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const admin = usePlatformAdminConfig();

  const { data: providers = [], isLoading, isError, refetch } = useQuery({
    queryKey: [...PROVIDERS_QUERY_KEY, admin.tenantId],
    queryFn: listModelProviders,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
  };

  const toggleMutation = useMutation({
    mutationFn: ({ providerId, enabled }: { providerId: string; enabled: boolean }) =>
      setModelProviderEnabled(providerId, enabled),
    onSuccess: () => {
      message.success(intl.formatMessage({ id: 'platformModelProvider.toggleSuccess' }));
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
          intl.formatMessage({ id: 'platformModelProvider.toggleFailed' }),
        ),
      );
      invalidate();
    },
  });

  const refreshMutation = useMutation({
    mutationFn: refreshModelProviders,
    onSuccess: (res) => {
      message.success(
        intl.formatMessage(
          { id: 'platformModelProvider.refreshSuccess' },
          { count: res.providers?.length ?? 0 },
        ),
      );
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
        getPlatformErrorMessage(err, intl.formatMessage({ id: 'platformModelProvider.refreshFailed' })),
      );
    },
  });

  const columns: ColumnsType<PlatformModelProviderState> = [
    {
      title: intl.formatMessage({ id: 'platformModelProvider.col.provider' }),
      dataIndex: 'providerId',
      render: (providerId: string) => {
        const knownIds = ['dashscope', 'openai', 'azure'] as const;
        if ((knownIds as readonly string[]).includes(providerId)) {
          return intl.formatMessage({ id: providerLabelId(providerId) });
        }
        return intl.formatMessage(
          { id: 'platformModelProvider.label.unknown' },
          { providerId },
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'platformModelProvider.col.enabled' }),
      dataIndex: 'enabled',
      width: 120,
      render: (enabled: boolean, row) => (
        <div className={styles.enableCell}>
          <Switch
            checked={enabled}
            checkedChildren={intl.formatMessage({ id: 'platformModelProvider.switchOn' })}
            unCheckedChildren={intl.formatMessage({ id: 'platformModelProvider.switchOff' })}
            loading={
              toggleMutation.isPending && toggleMutation.variables?.providerId === row.providerId
            }
            aria-label={intl.formatMessage({
              id: enabled ? 'platformModelProvider.switchOn' : 'platformModelProvider.switchOff',
            })}
            onChange={(checked) =>
              toggleMutation.mutate({ providerId: row.providerId, enabled: checked })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <section className={`${styles.screen} nebula-model-provider-screen`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Typography.Title level={3} className={styles.title}>
            {intl.formatMessage({ id: 'platformModelProvider.title' })}
          </Typography.Title>
          <Typography.Paragraph className={styles.subtitle}>
            {intl.formatMessage({ id: 'platformModelProvider.subtitle' })}
          </Typography.Paragraph>
        </div>
        <div className={styles.toolbar}>
          <Button icon={<SettingOutlined />} onClick={() => admin.setConfigOpen(true)}>
            {intl.formatMessage({ id: 'platformSkill.config' })}
          </Button>
          <Button icon={<ReloadOutlined />} loading={isLoading} onClick={() => void refetch()}>
            {intl.formatMessage({ id: 'agentHub.refresh' })}
          </Button>
          <Button
            icon={<SyncOutlined />}
            loading={refreshMutation.isPending}
            onClick={() => refreshMutation.mutate()}
          >
            {intl.formatMessage({ id: 'platformModelProvider.refresh' })}
          </Button>
        </div>
      </header>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message={intl.formatMessage({ id: 'platformModelProvider.loadFailed' })}
          action={
            <Button size="small" onClick={() => void refetch()}>
              {intl.formatMessage({ id: 'agentHub.retry' })}
            </Button>
          }
        />
      ) : null}

      <div className={styles.tableCard}>
        <Table<PlatformModelProviderState>
          rowKey="providerId"
          columns={columns}
          dataSource={providers}
          loading={isLoading}
          pagination={false}
          locale={{
            emptyText: intl.formatMessage({ id: 'platformModelProvider.empty' }),
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
