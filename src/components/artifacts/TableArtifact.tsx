import { Alert, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ChatArtifactPayload } from '@/utils/SuperAgentSse';

export interface TableArtifactProps {
  artifact: ChatArtifactPayload;
}

export default function TableArtifact({ artifact }: TableArtifactProps) {
  const columns: ColumnsType<Record<string, unknown>> = (artifact.columns || []).map((col) => ({
    title: col.title,
    dataIndex: col.key,
    key: col.key,
    ellipsis: true,
  }));

  return (
    <div className="artifact-table">
      {artifact.page?.truncated && (
        <Alert
          type="warning"
          showIcon
          message={`结果已截断，仅展示前 ${artifact.page?.pageSize ?? 100} 行`}
          style={{ marginBottom: 8 }}
        />
      )}
      <Table
        size="small"
        scroll={{ x: true }}
        pagination={false}
        columns={columns}
        dataSource={(artifact.rows || []).map((row, index) => ({ ...row, key: index }))}
        title={() => artifact.title || '查询结果'}
      />
    </div>
  );
}
