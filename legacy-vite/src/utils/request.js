import { API_BASE_URL } from '@/api'

function buildUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
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

function normalizeSseBuffer(buffer) {
  return buffer.replace(/\r\n/g, '\n')
}

function splitSseEvents(buffer, final = false) {
  const normalized = normalizeSseBuffer(buffer)
  const events = []
  let remaining = normalized

  let boundary = remaining.indexOf('\n\n')
  while (boundary !== -1) {
    events.push(remaining.slice(0, boundary))
    remaining = remaining.slice(boundary + 2)
    boundary = remaining.indexOf('\n\n')
  }

  if (final && remaining.trim()) {
    events.push(remaining)
    remaining = ''
  }

  return { events, remaining }
}

function parseSseEvent(eventBlock) {
  const dataLines = []

  for (const line of eventBlock.split('\n')) {
    if (!line || line.startsWith(':')) {
      continue
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^\s/, ''))
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  const data = dataLines.join('\n')
  return data === '[DONE]' ? null : data
}

function shouldIncludePayload(payload, handlers) {
  if (typeof handlers.includeInFullText === 'function') {
    return handlers.includeInFullText(payload)
  }
  return true
}

function consumeSseBuffer(buffer, onData, final = false) {
  const { events, remaining } = splitSseEvents(buffer, final)

  for (const event of events) {
    const data = parseSseEvent(event)
    if (data !== null) {
      onData(data)
    }
  }

  return remaining
}

export async function postStream(path, data, handlers = {}) {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, text/plain, application/json',
      ...(handlers.headers || {}),
    },
    body: JSON.stringify(data ?? {}),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  const isEventStream = contentType.includes('text/event-stream')

  if (!response.body) {
    const text = await response.text()
    if (isEventStream) {
      let fullText = ''
      consumeSseBuffer(text, (payload) => {
        if (shouldIncludePayload(payload, handlers)) {
          fullText += payload
        }
        handlers.onChunk?.(payload)
      }, true)
      handlers.onComplete?.(fullText)
      return fullText
    }

    handlers.onChunk?.(text)
    handlers.onComplete?.(text)
    return text
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let sseBuffer = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    const chunk = decoder.decode(value, { stream: true })

    if (isEventStream) {
      sseBuffer += chunk
      sseBuffer = consumeSseBuffer(sseBuffer, (payload) => {
        if (shouldIncludePayload(payload, handlers)) {
          fullText += payload
        }
        handlers.onChunk?.(payload)
      })
      continue
    }

    if (shouldIncludePayload(chunk, handlers)) {
      fullText += chunk
    }
    handlers.onChunk?.(chunk)
  }

  if (isEventStream) {
    consumeSseBuffer(sseBuffer, (payload) => {
      if (shouldIncludePayload(payload, handlers)) {
        fullText += payload
      }
      handlers.onChunk?.(payload)
    }, true)
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

export function patch(path, data) {
  return request(path, {
    method: 'PATCH',
    body: JSON.stringify(data ?? {}),
  })
}

export function del(path) {
  return request(path, { method: 'DELETE' })
}
