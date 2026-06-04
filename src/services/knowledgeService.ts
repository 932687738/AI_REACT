import { API_PATHS } from '@/constants/ApiPaths';
import { request } from '@/openapi/request';
import type {
  BatchDeleteDocumentsRequest,
  BatchDeleteDocumentsResponse,
  KnowledgeBase,
  KnowledgeBaseInput,
  KnowledgeDocument,
  UploadDocumentResponse,
} from '@/openapi/typings';

export function listKnowledgeBases() {
  return request<KnowledgeBase[]>(API_PATHS.agentHub.knowledgeBases, { method: 'GET' });
}

export function createKnowledgeBase(data: KnowledgeBaseInput) {
  return request<KnowledgeBase>(API_PATHS.agentHub.knowledgeBases, {
    method: 'POST',
    data,
  });
}

export function updateKnowledgeBase(id: string, data: KnowledgeBaseInput) {
  return request<KnowledgeBase>(`${API_PATHS.agentHub.knowledgeBases}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export function deleteKnowledgeBase(id: string) {
  return request<void>(`${API_PATHS.agentHub.knowledgeBases}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function normalizeUploadResponse(payload: UploadDocumentResponse): UploadDocumentResponse {
  return {
    documentId: payload.documentId ?? payload.document_id ?? null,
    language: payload.language ?? '',
    chunkCount: payload.chunkCount ?? payload.chunk_count ?? 0,
    alreadyExists: payload.alreadyExists ?? payload.already_exists ?? false,
    message: payload.message ?? '',
    chunksPreview: payload.chunksPreview ?? payload.chunks_preview ?? [],
  };
}

export function normalizeBatchDeleteResponse(
  payload: BatchDeleteDocumentsResponse,
): BatchDeleteDocumentsResponse {
  const results = payload.results ?? [];
  const failedFromResults = results.filter((item) => !item.success).map((item) => item.documentId);
  const failedDocumentIds = payload.failedDocumentIds ?? failedFromResults;
  const deletedCount =
    payload.deletedCount ??
    payload.successCount ??
    results.filter((item) => item.success).length;

  return {
    ...payload,
    failedDocumentIds,
    deletedCount,
  };
}

export function listDocuments(knowledgeBaseId: string) {
  return request<KnowledgeDocument[]>(
    `${API_PATHS.agentHub.knowledgeBases}/${encodeURIComponent(knowledgeBaseId)}/documents`,
    { method: 'GET' },
  );
}

export function batchDeleteDocuments(body: BatchDeleteDocumentsRequest) {
  return request<BatchDeleteDocumentsResponse>(API_PATHS.agentHub.knowledgeDocumentsBatchDelete, {
    method: 'POST',
    data: body,
  }).then(normalizeBatchDeleteResponse);
}

export interface UploadDocumentOptions {
  file: File;
  knowledgeBaseId: string;
  replace?: boolean;
  onProgress?: (percent: number) => void;
}

function uploadDocumentWithProgress(
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<UploadDocumentResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const payload = JSON.parse(xhr.responseText) as UploadDocumentResponse;
          resolve(normalizeUploadResponse(payload));
        } catch {
          reject(new Error('Invalid upload response'));
        }
        return;
      }
      reject(new Error(`Upload failed: ${xhr.status}`));
    });
    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.open('POST', API_PATHS.agentHub.knowledgeUpload);
    xhr.send(formData);
  });
}

/** 上传：有 onProgress 时用 XHR（services 层例外，支持进度回调） */
export async function uploadDocument(options: UploadDocumentOptions): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append('file', options.file);
  formData.append('knowledgeBaseId', String(options.knowledgeBaseId));
  formData.append('replace', String(options.replace ?? false));

  if (options.onProgress) {
    return uploadDocumentWithProgress(formData, options.onProgress);
  }

  const raw = await request<UploadDocumentResponse>(API_PATHS.agentHub.knowledgeUpload, {
    method: 'POST',
    data: formData,
    requestType: 'form',
  });

  return normalizeUploadResponse(raw);
}
