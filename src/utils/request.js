import { API_BASE_URL } from '@/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json')
    ? response.json()
    : response.text()
}

export function get(path, params) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : ''
  return request(`${path}${query}`, { method: 'GET' })
}

export function post(path, data) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(data ?? {}),
  })
}

export async function postStream(path, data, handlers = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(handlers.headers || {}),
    },
    body: JSON.stringify(data ?? {}),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  if (!response.body) {
    const text = await response.text()
    handlers.onChunk?.(text)
    handlers.onComplete?.(text)
    return text
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    const chunk = decoder.decode(value, { stream: true })
    fullText += chunk
    handlers.onChunk?.(chunk)
  }

  handlers.onComplete?.(fullText)
  return fullText
}

export function put(path, data) {
  return request(path, {
    method: 'PUT',
    body: JSON.stringify(data ?? {}),
  })
}

export function del(path) {
  return request(path, { method: 'DELETE' })
}
