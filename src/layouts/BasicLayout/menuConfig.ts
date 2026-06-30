import { ROUTES } from '@/constants/routes';
import type { SidebarModuleGroup } from './types';

export const SIDEBAR_MODULES: SidebarModuleGroup[] = [
  {
    id: 'chat',
    titleId: 'layout.sidebar.chatGroup',
    items: [
      { key: 'knowledge', path: ROUTES.CHAT_KNOWLEDGE, labelId: 'layout.nav.knowledgeChat' },
      { key: 'agent', path: ROUTES.CHAT_AGENT, labelId: 'layout.nav.agentChat' },
      {
        key: 'requirement-dev',
        path: ROUTES.CHAT_REQUIREMENT_DEV,
        labelId: 'layout.nav.projectManagerChat',
      },
      { key: 'human-review', path: ROUTES.CHAT_HUMAN_REVIEW, labelId: 'layout.nav.humanReview' },
    ],
  },
  {
    id: 'knowledge',
    titleId: 'layout.sidebar.knowledgeGroup',
    items: [
      { key: 'upload', path: ROUTES.KNOWLEDGE_UPLOAD, labelId: 'layout.nav.upload' },
      { key: 'bases', path: ROUTES.KNOWLEDGE_BASES, labelId: 'layout.nav.kbManager' },
    ],
  },
  {
    id: 'agentHub',
    titleId: 'layout.sidebar.agentHubGroup',
    items: [
      { key: 'skills', path: ROUTES.AGENT_HUB_SKILLS, labelId: 'layout.nav.skills' },
      { key: 'platform-agents', path: ROUTES.AGENT_HUB_PLATFORM_AGENTS, labelId: 'layout.nav.platformAgents' },
      { key: 'prompt-management', path: ROUTES.AGENT_HUB_PROMPT_MANAGEMENT, labelId: 'layout.nav.promptManagement' },
      { key: 'flow-management', path: ROUTES.FLOW_MANAGEMENT, labelId: 'layout.nav.flowManagement' },
      { key: 'flow-executions', path: ROUTES.FLOW_EXECUTIONS, labelId: 'layout.nav.flowExecutions' },
      { key: 'platform-tools', path: ROUTES.AGENT_HUB_PLATFORM_TOOLS, labelId: 'layout.nav.platformTools' },
      { key: 'model-providers', path: ROUTES.AGENT_HUB_MODEL_PROVIDERS, labelId: 'layout.nav.modelProviders' },
      { key: 'uncovered-intents', path: ROUTES.AGENT_HUB_UNCOVERED_INTENTS, labelId: 'layout.nav.uncoveredIntents' },
      { key: 'suspended-workflows', path: ROUTES.AGENT_HUB_SUSPENDED_WORKFLOWS, labelId: 'layout.nav.suspendedWorkflows' },
      { key: 'agents', path: ROUTES.AGENT_HUB_AGENTS, labelId: 'layout.nav.agents' },
      { key: 'tools', path: ROUTES.AGENT_HUB_TOOLS, labelId: 'layout.nav.tools' },
      { key: 'mcp', path: ROUTES.AGENT_HUB_MCP, labelId: 'layout.nav.mcp' },
    ],
  },
];

export function resolveModuleIdFromPath(pathname: string): SidebarModuleGroup['id'] {
  if (pathname.startsWith('/knowledge/')) {
    return 'knowledge';
  }
  if (pathname.startsWith('/agent-hub/')) {
    return 'agentHub';
  }
  return 'chat';
}
