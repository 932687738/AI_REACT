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
  AGENT_HUB_PLATFORM_AGENTS: '/agent-hub/platform-agents',
  AGENT_HUB_PLATFORM_TOOLS: '/agent-hub/platform-tools',
  AGENT_HUB_MODEL_PROVIDERS: '/agent-hub/model-providers',
  AGENT_HUB_UNCOVERED_INTENTS: '/agent-hub/uncovered-intents',
  AGENT_HUB_SUSPENDED_WORKFLOWS: '/agent-hub/suspended-workflows',
  AGENT_HUB_PROMPT_MANAGEMENT: '/agent-hub/prompt-management',
  FLOW_MANAGEMENT: '/agent-hub/flow-management',
  FLOW_DESIGNER: '/agent-hub/flow-designer',
  FLOW_EXECUTIONS: '/agent-hub/flow-executions',
  SETTINGS: '/settings',
  SHARE: '/share',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export function flowDesignerRoute(flowId: number): string {
  return `${ROUTES.FLOW_DESIGNER}/${flowId}`;
}

export function flowExecutionDetailRoute(executionId: number): string {
  return `${ROUTES.FLOW_EXECUTIONS}/${executionId}`;
}

export function isChatRoute(pathname: string): boolean {
  return (
    pathname.startsWith(ROUTES.CHAT_KNOWLEDGE) ||
    pathname.startsWith(ROUTES.CHAT_AGENT) ||
    pathname.startsWith(ROUTES.CHAT_REQUIREMENT_DEV)
  );
}
