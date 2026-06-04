/** Umi 路由常量，与 design §4.5 对齐 */
export const ROUTES = {
  CHAT_KNOWLEDGE: '/chat/knowledge',
  CHAT_AGENT: '/chat/agent',
  CHAT_REQUIREMENT_DEV: '/chat/requirement-dev',
  CHAT_HUMAN_REVIEW: '/chat/human-review',
  KNOWLEDGE_UPLOAD: '/knowledge/upload',
  KNOWLEDGE_BASES: '/knowledge/bases',
  AGENT_HUB_SKILLS: '/agent-hub/skills',
  AGENT_HUB_AGENTS: '/agent-hub/agents',
  AGENT_HUB_TOOLS: '/agent-hub/tools',
  AGENT_HUB_MCP: '/agent-hub/mcp',
  SETTINGS: '/settings',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export function isChatRoute(pathname: string): boolean {
  return (
    pathname.startsWith(ROUTES.CHAT_KNOWLEDGE) ||
    pathname.startsWith(ROUTES.CHAT_AGENT) ||
    pathname.startsWith(ROUTES.CHAT_REQUIREMENT_DEV)
  );
}
