import type { ReactNode } from 'react';
import { Tag, Typography } from 'antd';
import type { ChatArtifactPayload } from '@/utils/SuperAgentSse';

const { Text } = Typography;

function SpaceLike({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{children}</div>;
}

export interface CodeArtifactProps {
  artifact: ChatArtifactPayload;
}

export default function CodeArtifact({ artifact }: CodeArtifactProps) {
  return (
    <div className="artifact-code">
      <SpaceLike>
        <Text strong>{artifact.title || '代码'}</Text>
        {artifact.language && <Tag>{artifact.language}</Tag>}
      </SpaceLike>
      <pre
        style={{
          marginTop: 8,
          padding: 12,
          background: '#1e1e1e',
          color: '#d4d4d4',
          borderRadius: 8,
          overflow: 'auto',
        }}
      >
        <code>{artifact.content}</code>
      </pre>
    </div>
  );
}
