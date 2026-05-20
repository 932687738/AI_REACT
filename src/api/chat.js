import { API } from '@/api'
import { postStream } from '@/utils/request'

const STREAM_DELAY = 32

function createMockReply(message, language) {
  if (language === 'en') {
    return `Mock stream connected. Your message was: "${message}". This response is streaming token by token now, and you can replace it with a real backend later without changing the page structure.`
  }

  return `Mock 流式通道已接入。你刚刚发送的是：“${message}”。当前回复会以逐段流式输出的方式展示，后续替换成真实后端时不需要改动页面结构。`
}

async function mockStream(message, language, handlers = {}) {
  const reply = createMockReply(message, language)
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

export async function sendChatMessage(payload, handlers = {}) {
  const useMock = import.meta.env.VITE_USE_MOCK_CHAT !== 'false'

  if (useMock) {
    return mockStream(payload.message, payload.language, handlers)
  }

  return postStream(API.chat.send, payload, handlers)
}
