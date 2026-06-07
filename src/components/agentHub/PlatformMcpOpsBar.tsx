import { ReloadOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import { Alert, Button, Typography, message } from 'antd';
import { useState } from 'react';
import styles from '@/components/platformAdmin/platformScreen.less';
import { usePlatformAdminConfig } from '@/hooks/usePlatformAdminConfig';
import PlatformAdminSettingsDrawer from '@/components/platformAdmin/PlatformAdminSettingsDrawer';
import { refreshMcpTools } from '@/services/platformMcpAdminService';
import {
  getPlatformErrorMessage,
  handlePlatformUnauthorized,
} from '@/utils/platformUnauthorized';

export interface PlatformMcpOpsBarProps {
  onRefreshComplete?: () => void;
}

export default function PlatformMcpOpsBar({ onRefreshComplete }: PlatformMcpOpsBarProps) {
  const intl = useIntl();
  const admin = usePlatformAdminConfig();
  const [lastResult, setLastResult] = useState<string | null>(null);

  const refreshMutation = useMutation({
    mutationFn: refreshMcpTools,
    onSuccess: (res) => {
      const summary = intl.formatMessage(
        { id: 'platformOps.mcpRefreshResult' },
        {
          before: res.externalToolsBefore,
          after: res.externalToolsAfter,
          callbacks: (res.mcpCallbacks ?? []).join(', ') || '—',
        },
      );
      setLastResult(summary);
      message.success(intl.formatMessage({ id: 'platformOps.mcpRefreshSuccess' }));
      onRefreshComplete?.();
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
        getPlatformErrorMessage(err, intl.formatMessage({ id: 'platformOps.mcpRefreshFailed' })),
      );
    },
  });

  return (
    <>
      <div className={`${styles.opsBar} nebula-mcp-ops-bar`}>
        <Typography.Text className={styles.opsBarCopy}>
          {intl.formatMessage({ id: 'platformOps.mcpRefreshHint' })}
        </Typography.Text>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          loading={refreshMutation.isPending}
          onClick={() => refreshMutation.mutate()}
        >
          {intl.formatMessage({ id: 'platformOps.mcpRefresh' })}
        </Button>
      </div>
      {lastResult ? (
        <Alert type="success" showIcon message={lastResult} style={{ marginBottom: 16 }} />
      ) : null}
      <PlatformAdminSettingsDrawer
        open={admin.configOpen}
        onClose={() => admin.setConfigOpen(false)}
        tenantId={admin.tenantId}
        adminKey={admin.adminKey}
        onTenantIdChange={admin.setTenantId}
        onAdminKeyChange={admin.setAdminKey}
      />
    </>
  );
}
