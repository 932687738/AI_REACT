import { Card, Typography } from 'antd';
import { useIntl } from '@umijs/max';

const { Title, Paragraph } = Typography;

export default function ModulePlaceholder() {
  const intl = useIntl();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Card
        bordered={false}
        style={{
          background: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
        }}
      >
        <Title level={4} style={{ color: '#e5eefb', marginTop: 0 }}>
          {intl.formatMessage({ id: 'page.placeholder.title' })}
        </Title>
        <Paragraph style={{ color: 'rgba(203, 213, 225, 0.88)', marginBottom: 0 }}>
          {intl.formatMessage({ id: 'page.placeholder.desc' })}
        </Paragraph>
      </Card>
    </div>
  );
}
