import { API_BASE_URL, API } from '@/api'

function buildUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export function listKnowledgeBases() {
  return fetch(buildUrl(API.agentHub.knowledgeBases)).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    return response.json()
  })
}

export function createKnowledgeBase(data) {
  return fetch(buildUrl(API.agentHub.knowledgeBases), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    return response.json()
  })
}

export function updateKnowledgeBase(id, data) {
  return fetch(buildUrl(`${API.agentHub.knowledgeBases}/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    return response.json()
  })
}

export function deleteKnowledgeBase(id) {
  return fetch(buildUrl(`${API.agentHub.knowledgeBases}/${id}`), {
    method: 'DELETE',
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
  })
}

export function listDocuments(knowledgeBaseId) {
  return fetch(buildUrl(`${API.agentHub.knowledgeBases}/${knowledgeBaseId}/documents`)).then(
    async (response) => {
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }
      return response.json()
    },
  )
}

export function batchDeleteDocuments({ knowledgeBaseId, documentIds }) {
  return fetch(buildUrl(API.agentHub.knowledgeDocumentsBatchDelete), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ knowledgeBaseId, documentIds }),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    return response.json()
  })
}

export async function uploadDocument({ file, knowledgeBaseId, replace = false, onProgress }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('knowledgeBaseId', String(knowledgeBaseId))
  formData.append('replace', String(replace))

  const xhr = new XMLHttpRequest()

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const payload = parseJsonResponse(xhr.responseText)
        if (payload == null) {
          reject(new Error('Invalid response'))
          return
        }
        resolve(normalizeUploadResponse(payload))
        return
      }
      reject(new Error(`Upload failed: ${xhr.status}`))
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.open('POST', buildUrl(API.agentHub.knowledgeUpload))
    xhr.send(formData)
  })
}

function parseJsonResponse(responseText) {
  if (responseText == null || responseText.trim() === '') {
    return null
  }
  try {
    return JSON.parse(responseText)
  } catch {
    return null
  }
}

function normalizeUploadResponse(payload) {
  if (payload == null || typeof payload !== 'object') {
    return payload
  }
  return {
    documentId: payload.documentId ?? payload.document_id ?? null,
    language: payload.language ?? '',
    chunkCount: payload.chunkCount ?? payload.chunk_count ?? 0,
    alreadyExists: payload.alreadyExists ?? payload.already_exists ?? false,
    message: payload.message ?? '',
    chunksPreview: payload.chunksPreview ?? payload.chunks_preview ?? [],
  }
}
