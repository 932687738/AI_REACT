import { Button, Card, Space, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  return (
    <div className="umi-welcome">
      <Card style={{ maxWidth: 640, margin: '48px auto' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={3}>Nebula Desk</Title>
          <Paragraph type="secondary">
            Umi 4 工程骨架已就绪。后续任务将接入布局、对话与知识库模块。
          </Paragraph>
          <Paragraph>
            <Typography.Text code>harness dev</Typography.Text> 启动开发服务器；
            API 代理：<Typography.Text code>/api</Typography.Text>、
            <Typography.Text code>/springai</Typography.Text>
          </Paragraph>
          <Button type="primary" href="/">
            首页
          </Button>
        </Space>
      </Card>
    </div>
  );
}
