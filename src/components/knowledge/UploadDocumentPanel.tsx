import { InboxOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl, useSearchParams } from '@umijs/max';
import {
  Button,
  Modal,
  Progress,
  Select,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  batchDeleteDocuments,
  listDocuments,
  listKnowledgeBases,
  uploadDocument,
} from '@/services/knowledgeService';
import type { KnowledgeDocument } from '@/openapi/typings';
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  UPLOAD_FORMAT_LABELS,
  formatDocumentTime,
  isAllowedUploadFile,
} from '@/utils/knowledgeUpload';
import styles from './knowledgeScreen.less';

const KNOWLEDGE_BASES_KEY = ['knowledge-bases'] as const;

function documentsKey(kbId: string) {
  return ['knowledge-documents', kbId] as const;
}

export default function UploadDocumentPanel() {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const initialKb = searchParams.get('kb') || '';
  const highlightDocumentId = searchParams.get('doc') || '';

  const [selectedKbId, setSelectedKbId] = useState(initialKb);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const { data: knowledgeBases = [], isLoading: kbLoading } = useQuery({
    queryKey: KNOWLEDGE_BASES_KEY,
    queryFn: listKnowledgeBases,
  });

  const resolvedKbId = useMemo(() => {
    if (initialKb) {
      return initialKb;
    }
    if (selectedKbId) {
      return selectedKbId;
    }
    return knowledgeBases[0]?.id ? String(knowledgeBases[0].id) : '';
  }, [initialKb, knowledgeBases, selectedKbId]);

  useEffect(() => {
    if (!selectedKbId && knowledgeBases.length > 0 && !initialKb) {
      setSelectedKbId(String(knowledgeBases[0].id));
    }
  }, [initialKb, knowledgeBases, selectedKbId]);

  const {
    data: documents = [],
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: documentsKey(resolvedKbId),
    queryFn: () => listDocuments(resolvedKbId),
    enabled: Boolean(resolvedKbId),
  });

  useEffect(() => {
    if (!highlightDocumentId || documentsLoading) {
      return;
    }
    const row = document.querySelector(`[data-row-key="${highlightDocumentId}"]`);
    row?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.delete('doc');
      setSearchParams(next, { replace: true });
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [documents, documentsLoading, highlightDocumentId, searchParams, setSearchParams]);

  const deleteMutation = useMutation({
    mutationFn: (documentIds: string[]) =>
      batchDeleteDocuments({
        knowledgeBaseId: resolvedKbId,
        documentIds,
      }),
    onSuccess: (response) => {
      void refetchDocuments();
      const failed = response.failedDocumentIds ?? [];
      if (failed.length > 0) {
        setSelectedRowKeys(failed);
        message.warning(
          intl.formatMessage({
            id:
              (response.deletedCount ?? 0) === 0
                ? 'knowledge.upload.deleteAllFailed'
                : 'knowledge.upload.deletePartialFailed',
          }),
        );
        return;
      }
      setSelectedRowKeys([]);
      message.success(intl.formatMessage({ id: 'knowledge.upload.deleteSuccess' }));
    },
    onError: () => {
      message.error(intl.formatMessage({ id: 'knowledge.upload.deleteFailed' }));
    },
  });

  const runUpload = async (file: File, replace = false) => {
    if (!resolvedKbId) {
      message.warning(intl.formatMessage({ id: 'knowledge.upload.selectKb' }));
      return;
    }
    if (!isAllowedUploadFile(file)) {
      message.error(intl.formatMessage({ id: 'knowledge.upload.invalidFormat' }));
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const response = await uploadDocument({
        file,
        knowledgeBaseId: resolvedKbId,
        replace,
        onProgress: setUploadProgress,
      });
      const title = response.alreadyExists
        ? intl.formatMessage({ id: 'knowledge.upload.exists' })
        : intl.formatMessage({ id: 'knowledge.upload.success' });

      Modal.info({
        title,
        content: (
          <div>
            <p>{response.message || title}</p>
            <ul>
              <li>
                {intl.formatMessage({ id: 'knowledge.upload.docId' })}: {response.documentId ?? '—'}
              </li>
              <li>
                {intl.formatMessage({ id: 'knowledge.upload.language' })}: {response.language || '—'}
              </li>
              <li>
                {intl.formatMessage({ id: 'knowledge.upload.chunkCount' })}: {response.chunkCount ?? 0}
              </li>
            </ul>
            {response.alreadyExists && !replace ? (
              <Button
                type="link"
                onClick={() => {
                  Modal.destroyAll();
                  void runUpload(file, true);
                }}
              >
                {intl.formatMessage({ id: 'knowledge.upload.replace' })}
              </Button>
            ) : null}
          </div>
        ),
      });
      void queryClient.invalidateQueries({ queryKey: documentsKey(resolvedKbId) });
    } catch {
      message.error(intl.formatMessage({ id: 'knowledge.upload.failed' }));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = (file: File) => runUpload(file, false);

  const uploadProps: UploadProps = {
    multiple: false,
    showUploadList: false,
    disabled: !resolvedKbId || uploading || deleteMutation.isPending,
    accept: ALLOWED_UPLOAD_EXTENSIONS.join(','),
    beforeUpload: (file) => {
      void handleUpload(file);
      return Upload.LIST_IGNORE;
    },
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      return;
    }
    Modal.confirm({
      title: intl.formatMessage({ id: 'knowledge.upload.batchDelete' }),
      content: intl.formatMessage(
        { id: 'knowledge.upload.batchDeleteConfirm' },
        { count: selectedRowKeys.length },
      ),
      okText: intl.formatMessage({ id: 'knowledge.upload.batchDelete' }),
      cancelText: intl.formatMessage({ id: 'knowledge.kb.cancel' }),
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(selectedRowKeys),
    });
  };

  const kbReady = knowledgeBases.length > 0 && Boolean(resolvedKbId);
  const locale = intl.locale;

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <Typography.Title level={3} className={styles.title}>
          {intl.formatMessage({ id: 'knowledge.upload.title' })}
        </Typography.Title>
        <Typography.Paragraph className={styles.subtitle}>
          {intl.formatMessage({ id: 'knowledge.upload.subtitle' })}
        </Typography.Paragraph>
      </header>

      <div className={styles.uploadLayout}>
        <div className={styles.panel}>
          <Typography.Text>{intl.formatMessage({ id: 'knowledge.upload.selectKbLabel' })}</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            loading={kbLoading}
            value={resolvedKbId || undefined}
            placeholder={intl.formatMessage({ id: 'knowledge.upload.noKb' })}
            onChange={(value) => {
              setSelectedKbId(value);
              setSelectedRowKeys([]);
              const next = new URLSearchParams(searchParams);
              next.set('kb', value);
              next.delete('doc');
              setSearchParams(next, { replace: true });
            }}
            options={knowledgeBases.map((kb) => ({
              value: String(kb.id),
              label: kb.name,
            }))}
          />

          <div
            className={`${styles.dropzoneShell} ${!kbReady ? styles.dropzoneDisabled : ''}`}
          >
            <Upload.Dragger {...uploadProps} className={styles.dropzoneInner}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className={styles.dropzoneHint}>
              {kbReady
                ? intl.formatMessage({ id: 'knowledge.upload.dropHint' })
                : intl.formatMessage({ id: 'knowledge.upload.dropDisabled' })}
            </p>
            <div className={styles.formatChips}>
              {UPLOAD_FORMAT_LABELS.map((label) => (
                <span key={label} className={styles.formatChip}>
                  {label}
                </span>
              ))}
            </div>
            <Button type="primary" disabled={!kbReady || uploading}>
              {uploading
                ? intl.formatMessage({ id: 'knowledge.upload.uploading' })
                : intl.formatMessage({ id: 'knowledge.upload.chooseFile' })}
            </Button>
          </Upload.Dragger>
          </div>

          {uploading ? (
            <div className={styles.progressWrap}>
              <Progress percent={uploadProgress} status="active" />
            </div>
          ) : null}
        </div>

        <div className={styles.tableCard}>
          <div className={styles.documentsHeader}>
            <Typography.Title level={5} className={styles.documentsTitle}>
              {intl.formatMessage({ id: 'knowledge.upload.documentsTitle' })}
              {documents.length > 0 ? ` (${documents.length})` : ''}
            </Typography.Title>
            <Button
              danger
              disabled={selectedRowKeys.length === 0 || deleteMutation.isPending || !resolvedKbId}
              loading={deleteMutation.isPending}
              onClick={handleBatchDelete}
            >
              {selectedRowKeys.length > 0
                ? `${intl.formatMessage({ id: 'knowledge.upload.batchDelete' })} (${selectedRowKeys.length})`
                : intl.formatMessage({ id: 'knowledge.upload.batchDelete' })}
            </Button>
          </div>

          <Table<KnowledgeDocument>
            rowKey="id"
            loading={documentsLoading}
            dataSource={documents}
            pagination={false}
            locale={{
              emptyText: intl.formatMessage({ id: 'knowledge.upload.documentsEmpty' }),
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as string[]),
            }}
            rowClassName={(record) =>
              String(record.id) === highlightDocumentId ? styles.highlightRow : ''
            }
            columns={[
              {
                title: intl.formatMessage({ id: 'knowledge.upload.docNameCol' }),
                dataIndex: 'fileName',
                render: (value, record) => value || record.name || '—',
              },
              {
                title: intl.formatMessage({ id: 'knowledge.upload.chunkCount' }),
                dataIndex: 'chunkCount',
                width: 100,
              },
              {
                title: intl.formatMessage({ id: 'knowledge.upload.updatedCol' }),
                dataIndex: 'updatedAt',
                width: 180,
                render: (value) => formatDocumentTime(value, locale),
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
