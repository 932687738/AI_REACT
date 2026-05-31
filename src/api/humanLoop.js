import { API_BASE_URL } from '@/api'

const BASE = '/springai/demo/alibaba-graph/human-loop'

function buildUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

async function handleJson(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const error = new Error(
      '后端未返回 JSON，请确认 ai 服务已启动且 Vite 已代理 /springai（开发环境需重启 npm run dev）',
    )
    error.status = response.status
    throw error
  }
  if (!response.ok) {
    let message = `Request failed: ${response.status}`
    try {
      const body = await response.json()
      if (body?.message) {
        message = body.message
      }
    } catch {
      // ignore parse errors
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return response.json()
}

export function hilStep1(threadId, prompt = '') {
  const q = new URLSearchParams({ threadId, prompt })
  return fetch(buildUrl(`${BASE}/step1?${q}`)).then(handleJson)
}

export function hilStep2(body) {
  return fetch(buildUrl(`${BASE}/step2`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleJson)
}

export function toolFeedbackInvoke(threadId, question) {
  const q = new URLSearchParams({ threadId, question })
  return fetch(buildUrl(`${BASE}/tool-feedback/invoke?${q}`)).then(handleJson)
}

export function toolFeedbackResume(body) {
  return fetch(buildUrl(`${BASE}/tool-feedback/resume`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleJson)
}

export function toolFeedbackApprove(threadId) {
  const q = new URLSearchParams({ threadId })
  return fetch(buildUrl(`${BASE}/tool-feedback/resume/approve?${q}`), {
    method: 'POST',
  }).then(handleJson)
}

export function toolFeedbackReject(threadId, rejectReason) {
  const q = new URLSearchParams({ threadId, rejectReason })
  return fetch(buildUrl(`${BASE}/tool-feedback/resume/reject?${q}`), {
    method: 'POST',
  }).then(handleJson)
}

export function toolFeedbackEdit(threadId, toolName, editedArguments) {
  const q = new URLSearchParams({ threadId, toolName })
  if (editedArguments) {
    q.set('editedArguments', editedArguments)
  }
  return fetch(buildUrl(`${BASE}/tool-feedback/resume/edit?${q}`), {
    method: 'POST',
  }).then(handleJson)
}

export function enterpriseContractReview(contractText = '') {
  const q = new URLSearchParams({ contractText })
  return fetch(buildUrl(`${BASE}/enterprise/contract-review?${q}`)).then(handleJson)
}

export function enterpriseEcommerceCs(userMessage = '') {
  const q = new URLSearchParams({ userMessage })
  return fetch(buildUrl(`${BASE}/enterprise/ecommerce-cs?${q}`)).then(handleJson)
}

export function enterprisePublishingStep1(threadId, hotKeywords = '') {
  const q = new URLSearchParams({ threadId, hotKeywords })
  return fetch(buildUrl(`${BASE}/enterprise/publishing/step1?${q}`)).then(handleJson)
}

export function enterprisePublishingStep2(body) {
  return fetch(buildUrl(`${BASE}/enterprise/publishing/step2`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleJson)
}
