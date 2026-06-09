import type { ChatArtifactPayload } from '@/utils/SuperAgentSse';
import styles from './artifacts.less';
import CodeArtifact from '@/components/artifacts/CodeArtifact';
import SqlReviewArtifact from '@/components/artifacts/SqlReviewArtifact';
import TableArtifact from '@/components/artifacts/TableArtifact';

export interface ArtifactRendererProps {
  artifacts: ChatArtifactPayload[];
  onSqlConfirm?: () => void;
  onSqlRevise?: () => void;
}

export default function ArtifactRenderer({
  artifacts,
  onSqlConfirm,
  onSqlRevise,
}: ArtifactRendererProps) {
  if (!artifacts?.length) {
    return null;
  }
  return (
    <div className={`chat-artifacts ${styles.artifactPanel}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {artifacts.map((artifact) => {
        if (artifact.kind === 'sql-review') {
          return (
            <SqlReviewArtifact
              key={artifact.id}
              artifact={artifact}
              onConfirm={onSqlConfirm}
              onRevise={onSqlRevise}
            />
          );
        }
        if (artifact.kind === 'table') {
          return <TableArtifact key={artifact.id} artifact={artifact} />;
        }
        if (artifact.kind === 'code') {
          return <CodeArtifact key={artifact.id} artifact={artifact} />;
        }
        return null;
      })}
    </div>
  );
}
