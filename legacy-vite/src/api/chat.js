import { API } from '@/api'
import { CHAT_MODE } from '@/constants/chatMode'
import {
  isKnowledgeMetaPayload,
  parseKnowledgeMetaPayload,
  stripKnowledgeMetaFromText,
} from '@/utils/knowledgeCitation'
import { postStream } from '@/utils/request'

const STREAM_DELAY = 32

function resolveModeLabel(mode) {
  if (mode === CHAT_MODE.KNOWLEDGE) {
    return 'knowledge'
  }
  if (mode === CHAT_MODE.REQUIREMENT_DEV) {
    return 'requirement-dev'
  }
  return 'agent'
}

function createMockReply(message, conversationId, language, mode) {
  const modeLabel = resolveModeLabel(mode)

  if (language === 'en') {
    return `Mock stream connected. mode=${modeLabel}, conversationId=${conversationId}. Your message was: "${message}". This response is streaming token by token now, and you can replace it with the real backend later without changing the page structure.`
  }

  return `Mock 流式通道已接入。mode=${modeLabel}，conversationId=${conversationId}。你刚刚发送的是：“${message}”。当前回复会以分段流式输出的方式展示，后续替换成真实后端时不需要改动页面结构。`
}

async function mockStream(payload, handlers = {}, mode) {
  const reply = createMockReply(payload.message, payload.conversationId, payload.language, mode)
  const chunks = reply.match(/.{1,8}/g) || []
  let fullText = ''

  for (const chunk of chunks) {
    await new Promise((resolve) => setTimeout(resolve, STREAM_DELAY))
    fullText += chunk
    handlers.onChunk?.(chunk)
  }

  handlers.onComplete?.(fullText)
  return fullText
}

function buildRequestBody(payload) {
  const body = {
    conversationId: payload.conversationId,
    sessionId: payload.sessionId || payload.conversationId,
    message: payload.message,
  }
  if (payload.knowledgeBaseIds?.length) {
    body.knowledgeBaseIds = payload.knowledgeBaseIds
  }
  return body
}

/** 知识库模式：POST /api/agent-hub/chat/knowledge */
export async function sendKnowledgeChatMessage(payload, handlers = {}) {
  const useMock = import.meta.env.VITE_USE_MOCK_CHAT === 'true'
  const requestBody = buildRequestBody(payload)

  if (useMock) {
    return mockStream(payload, handlers, CHAT_MODE.KNOWLEDGE)
  }

  return postStream(API.agentHub.chatKnowledge, requestBody, {
    ...handlers,
    includeInFullText: (chunk) => !isKnowledgeMetaPayload(chunk),
    onChunk: (chunk) => {
      if (isKnowledgeMetaPayload(chunk)) {
        handlers.onMeta?.(parseKnowledgeMetaPayload(chunk))
        return
      }
      handlers.onChunk?.(chunk)
    },
    onComplete: (fullText) => {
      handlers.onComplete?.(stripKnowledgeMetaFromText(fullText))
    },
  })
}

/** 智能体模式：POST /api/super-agents/chat（SuperAgents 平台，与存量 Agent Hub 分离） */
export async function sendAgentChatMessage(payload, handlers = {}) {
  const useMock = import.meta.env.VITE_USE_MOCK_CHAT === 'true'
  const requestBody = {
    conversationId: payload.conversationId,
    message: payload.message,
  }
  const tenantId = import.meta.env.VITE_SUPER_AGENTS_TENANT_ID || 'default'

  if (useMock) {
    return mockStream(payload, handlers, CHAT_MODE.AGENT)
  }

  return postStream(API.superAgents.chat, requestBody, {
    ...handlers,
    headers: {
      ...(handlers.headers || {}),
      'X-Tenant-Id': tenantId,
    },
  })
}

/** 需求开发模式：POST /api/agent-hub/requirement-dev */
export async function sendRequirementDevMessage(payload, handlers = {}) {
  const useMock = import.meta.env.VITE_USE_MOCK_CHAT === 'true'
  const requestBody = {
    conversationId: payload.conversationId,
    requirement: payload.message,
  }

  if (useMock) {
    return mockStream(payload, handlers, CHAT_MODE.REQUIREMENT_DEV)
  }

  return postStream(API.agentHub.requirementDev, requestBody, handlers)
}

/** 按 UI 模式选择对应聊天接口（不再传 mode 请求体字段） */
export async function sendChatMessage(payload, handlers = {}) {
  if (payload.mode === CHAT_MODE.AGENT) {
    return sendAgentChatMessage(payload, handlers)
  }
  if (payload.mode === CHAT_MODE.REQUIREMENT_DEV) {
    return sendRequirementDevMessage(payload, handlers)
  }
  return sendKnowledgeChatMessage(payload, handlers)
}
