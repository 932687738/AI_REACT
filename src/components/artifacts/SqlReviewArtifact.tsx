import { Alert, Button, Space, Typography } from 'antd';
import type { ChatArtifactPayload } from '@/utils/SuperAgentSse';
import styles from './artifacts.less';

const { Text, Paragraph } = Typography;

export interface SqlReviewArtifactProps {
  artifact: ChatArtifactPayload;
  onConfirm?: () => void;
  onRevise?: () => void;
}

/** MySQL 风格展示 SQL；实际执行 dialect 为 PostgreSQL */
export default function SqlReviewArtifact({ artifact, onConfirm, onRevise }: SqlReviewArtifactProps) {
  return (
    <div className={`artifact-sql-review ${styles.artifactPanel}`}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Text strong>{artifact.title || '待确认 SQL'}</Text>
        {artifact.executionDialect && (
          <Alert
            type="info"
            showIcon
            message={`展示语法：${artifact.displayDialect || 'mysql'} · 执行引擎：${artifact.executionDialect}`}
          />
        )}
        <pre className={styles.artifactSqlBlock}>
          <code>{artifact.content}</code>
        </pre>
        {artifact.summary && <Paragraph type="secondary">{artifact.summary}</Paragraph>}
        <Space className={styles.artifactActions}>
          <Button type="primary" size="small" onClick={onConfirm}>
            确认执行
          </Button>
          <Button size="small" onClick={onRevise}>
            修改条件
          </Button>
        </Space>
      </Space>
    </div>
  );
}
