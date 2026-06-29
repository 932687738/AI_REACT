import { API_PATHS } from '@/constants/ApiPaths';
import { CHAT_MODE } from '@/constants/chatMode';
import type {
  AgentChatRequest,
  KnowledgeChatRequest,
  RequirementDevChatRequest,
} from '@/openapi/typings';
import { postStream } from '@/utils/StreamSse';
import { isAgentMetaPayload } from '@/utils/SuperAgentSse';
import {
  isKnowledgeMetaPayload,
  parseKnowledgeMetaPayload,
  stripKnowledgeMetaFromText,
} from '@/utils/KnowledgeCitation';
import type { ChatPayload, ChatStreamHandlers } from '@/types/chat';
import { resolveEnvString } from '@/utils/envString';
import { getStoredUserId } from '@/services/platformAdminCommon';

const STREAM_DELAY_MS = 32;
declare const __MOCK_CHAT__: string;

const MOCK_CHAT = __MOCK_CHAT__ === 'true';
const SUPER_AGENTS_TENANT_ID = resolveEnvString(
  process.env.SUPER_AGENTS_TENANT_ID as string | undefined,
  'default',
);

function buildKnowledgeBody(payload: ChatPayload): KnowledgeChatRequest {
  const body: KnowledgeChatRequest = {
    conversationId: payload.conversationId,
    sessionId: payload.sessionId || payload.conversationId,
    message: payload.message,
  };
  if (payload.knowledgeBaseIds?.length) {
    body.knowledgeBaseIds = payload.knowledgeBaseIds;
  }
  return body;
}

async function mockStream(payload: ChatPayload, handlers: ChatStreamHandlers, mode: string): Promise<string> {
  const language = payload.language || 'zh';
  const reply =
    language === 'en'
      ? `Mock stream connected. mode=${mode}, conversationId=${payload.conversationId}. Your message was: "${payload.message}".`
      : `Mock 流式通道已接入。mode=${mode}，conversationId=${payload.conversationId}。你刚刚发送的是：“${payload.message}”。`;

  const chunks = reply.match(/.{1,8}/g) || [];
  let fullText = '';

  for (const chunk of chunks) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, STREAM_DELAY_MS);
    });
    fullText += chunk;
    handlers.onChunk?.(chunk);
  }

  handlers.onComplete?.(fullText);
  return fullText;
}

export async function sendKnowledgeChat(payload: ChatPayload, handlers: ChatStreamHandlers = {}) {
  if (MOCK_CHAT) {
    return mockStream(payload, handlers, CHAT_MODE.KNOWLEDGE);
  }

  return postStream(API_PATHS.agentHub.chatKnowledge, buildKnowledgeBody(payload), {
    ...handlers,
    includeInFullText: (chunk) => !isKnowledgeMetaPayload(chunk),
    onChunk: (chunk) => {
      if (isKnowledgeMetaPayload(chunk)) {
        const meta = parseKnowledgeMetaPayload(chunk);
        if (meta) {
          handlers.onMeta?.(meta);
        }
        return;
      }
      handlers.onChunk?.(chunk);
    },
    onComplete: (fullText) => {
      handlers.onComplete?.(stripKnowledgeMetaFromText(fullText));
    },
  });
}

export async function sendAgentChat(payload: ChatPayload, handlers: ChatStreamHandlers = {}) {
  if (MOCK_CHAT) {
    return mockStream(payload, handlers, CHAT_MODE.AGENT);
  }

  const body: AgentChatRequest = {
    conversationId: payload.conversationId,
    message: payload.message,
  };
  if (payload.sessionVariables && Object.keys(payload.sessionVariables).length > 0) {
    body.sessionVariables = payload.sessionVariables;
  }

  return postStream(API_PATHS.superAgents.chat, body, {
    ...handlers,
    includeInFullText: (chunk) => !isAgentMetaPayload(chunk),
    headers: {
      ...(handlers.headers || {}),
      'X-Tenant-Id': SUPER_AGENTS_TENANT_ID,
      'X-User-Id': getStoredUserId(),
    },
  });
}

export async function sendRequirementDevChat(payload: ChatPayload, handlers: ChatStreamHandlers = {}) {
  if (MOCK_CHAT) {
    return mockStream(payload, handlers, CHAT_MODE.REQUIREMENT_DEV);
  }

  const body: RequirementDevChatRequest = {
    conversationId: payload.conversationId,
    requirement: payload.message,
  };

  return postStream(API_PATHS.agentHub.requirementDev, body, handlers);
}

export async function sendChatByMode(payload: ChatPayload, handlers: ChatStreamHandlers = {}) {
  if (payload.mode === CHAT_MODE.AGENT) {
    return sendAgentChat(payload, handlers);
  }
  if (payload.mode === CHAT_MODE.REQUIREMENT_DEV) {
    return sendRequirementDevChat(payload, handlers);
  }
  return sendKnowledgeChat(payload, handlers);
}
