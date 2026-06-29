/** 解析智能体 SSE 拼进正文的【路由】【进度】前缀，供展示层与正文分离 */

import type { AgentProgressStep } from '@/openapi/typings';

export interface AgentRoutingDisplay {
  agentLabel: string;
  skillLabel: string;
  toolsLabel: string;
  modelLabel?: string;
  routingModelLabel?: string;
}

const PROGRESS_LINE = /^【进度】[^\n]*\n?/gm;
const PROGRESS_CAPTURE = /【进度】([^:\n]+):\s*(\S+)/g;

export function extractProgressFromText(text: string): AgentProgressStep[] {
  const steps: AgentProgressStep[] = [];
  const source = String(text || '');
  let match = PROGRESS_CAPTURE.exec(source);
  while (match) {
    steps.push({ step: match[1].trim(), status: match[2].trim() });
    match = PROGRESS_CAPTURE.exec(source);
  }
  return steps;
}

export function stripAgentStreamDecorations(text: string): string {
  return String(text || '')
    .replace(PROGRESS_LINE, '')
    .trim();
}

function parseRoutingLine(line: string): AgentRoutingDisplay | null {
  if (!line) {
    return null;
  }
  const segments = line.split('|').map((part) => part.trim());
  const result: AgentRoutingDisplay = {
    agentLabel: '—',
    skillLabel: '—',
    toolsLabel: '—',
  };

  for (const segment of segments) {
    const agentMatch = segment.match(/^智能体[：:]\s*(.+)$/);
    if (agentMatch) {
      result.agentLabel = agentMatch[1].trim();
      continue;
    }
    const skillMatch = segment.match(/^Skill[：:]\s*(.+)$/i);
    if (skillMatch) {
      result.skillLabel = skillMatch[1].trim();
      continue;
    }
    const toolsMatch = segment.match(/^工具[：:]\s*(.+)$/);
    if (toolsMatch) {
      result.toolsLabel = toolsMatch[1].trim();
      continue;
    }
    const modelMatch = segment.match(/^模型[：:]\s*(.+)$/);
    if (modelMatch) {
      const modelText = modelMatch[1].trim();
      const routingInModel = modelText.match(/^(.+?)（路由[：:]\s*(.+?)）$/);
      if (routingInModel) {
        result.modelLabel = routingInModel[1].trim();
        result.routingModelLabel = routingInModel[2].trim();
      } else {
        result.modelLabel = modelText;
      }
    }
  }

  if (line.startsWith('混合意图')) {
    result.agentLabel = line;
  }

  return result;
}

export function parseAgentAssistantText(text: string): {
  routing: AgentRoutingDisplay | null;
  body: string;
} {
  const withoutProgress = stripAgentStreamDecorations(text);
  const trimmed = withoutProgress.trim();
  if (!trimmed.startsWith('【路由】')) {
    return { routing: null, body: trimmed };
  }

  const firstLineEnd = trimmed.indexOf('\n');
  const routingPayload =
    firstLineEnd === -1 ? trimmed.slice('【路由】'.length) : trimmed.slice('【路由】'.length, firstLineEnd);
  const body = firstLineEnd === -1 ? '' : trimmed.slice(firstLineEnd + 1).trim();
  return { routing: parseRoutingLine(routingPayload.trim()), body };
}
