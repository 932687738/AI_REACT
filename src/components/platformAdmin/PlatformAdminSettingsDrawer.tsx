import { useIntl } from '@umijs/max';
import { Drawer, Form, Input } from 'antd';

export interface PlatformAdminSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  adminKey: string;
  onTenantIdChange: (value: string) => void;
  onAdminKeyChange: (value: string) => void;
}

export default function PlatformAdminSettingsDrawer({
  open,
  onClose,
  tenantId,
  adminKey,
  onTenantIdChange,
  onAdminKeyChange,
}: PlatformAdminSettingsDrawerProps) {
  const intl = useIntl();

  return (
    <Drawer
      title={intl.formatMessage({ id: 'platformSkill.configTitle' })}
      open={open}
      onClose={onClose}
      width={400}
    >
      <Form layout="vertical">
        <Form.Item label={intl.formatMessage({ id: 'platformSkill.tenantId' })}>
          <Input
            value={tenantId}
            onChange={(e) => onTenantIdChange(e.target.value)}
            placeholder="default"
          />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({ id: 'platformSkill.adminKey' })}
          extra={intl.formatMessage({ id: 'platformSkill.adminKeyHint' })}
        >
          <Input.Password
            value={adminKey}
            onChange={(e) => onAdminKeyChange(e.target.value)}
            autoComplete="off"
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
