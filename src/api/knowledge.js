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
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          reject(new Error('Invalid response'))
        }
        return
      }
      reject(new Error(`Upload failed: ${xhr.status}`))
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.open('POST', buildUrl(API.agentHub.knowledgeUpload))
    xhr.send(formData)
  })
}
