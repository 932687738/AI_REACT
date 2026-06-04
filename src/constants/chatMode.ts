/** 与后端 AgentHubChatMode 语义对齐 */
export const CHAT_MODE = {
  KNOWLEDGE: 'knowledge',
  AGENT: 'agent',
  REQUIREMENT_DEV: 'requirementDev',
} as const;

export type ChatMode = (typeof CHAT_MODE)[keyof typeof CHAT_MODE];

export const DEFAULT_CHAT_MODE = CHAT_MODE.KNOWLEDGE;

export const API_CHAT_MODE = {
  [CHAT_MODE.KNOWLEDGE]: 'knowledge',
  [CHAT_MODE.AGENT]: 'agent',
  [CHAT_MODE.REQUIREMENT_DEV]: 'requirement-dev',
} as const;
