import { API } from '@/api'
import { CHAT_MODE } from '@/constants/chatMode'
import { postStream } from '@/utils/request'

const STREAM_DELAY = 32

function createMockReply(message, conversationId, language, mode) {
  const modeLabel = mode === CHAT_MODE.KNOWLEDGE ? 'knowledge' : 'agent'

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
  return {
    conversationId: payload.conversationId,
    message: payload.message,
  }
}

/** 知识库模式：POST /api/agent-hub/chat/knowledge */
export async function sendKnowledgeChatMessage(payload, handlers = {}) {
  const useMock = import.meta.env.VITE_USE_MOCK_CHAT === 'true'
  const requestBody = buildRequestBody(payload)

  if (useMock) {
    return mockStream(payload, handlers, CHAT_MODE.KNOWLEDGE)
  }

  return postStream(API.agentHub.chatKnowledge, requestBody, handlers)
}

/** 智能体模式：POST /api/agent-hub/chat/agent */
export async function sendAgentChatMessage(payload, handlers = {}) {
  const useMock = import.meta.env.VITE_USE_MOCK_CHAT === 'true'
  const requestBody = buildRequestBody(payload)

  if (useMock) {
    return mockStream(payload, handlers, CHAT_MODE.AGENT)
  }

  return postStream(API.agentHub.chatAgent, requestBody, handlers)
}

/** 按 UI 模式选择对应聊天接口（不再传 mode 请求体字段） */
export async function sendChatMessage(payload, handlers = {}) {
  if (payload.mode === CHAT_MODE.AGENT) {
    return sendAgentChatMessage(payload, handlers)
  }
  return sendKnowledgeChatMessage(payload, handlers)
}
