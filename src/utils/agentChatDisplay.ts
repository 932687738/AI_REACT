/** 解析智能体 SSE 拼进正文的【路由】【进度】【协作】前缀，供展示层与正文分离 */

import type { AgentProgressStep } from '@/openapi/typings';

export interface AgentRoutingDisplay {
  agentLabel: string;
  skillLabel: string;
  toolsLabel: string;
  modelLabel?: string;
  routingModelLabel?: string;
  /** 混合意图串行协作时的 Agent 链 */
  multiAgentChain?: string[];
  /** 粘性追问短路由 */
  stickyFollowUp?: boolean;
}

export interface AgentCollaborationStep {
  index: number;
  total: number;
  label: string;
}

const PROGRESS_LINE = /^【进度】[^\n]*\n?/gm;
const PROGRESS_CAPTURE = /【进度】([^:\n]+):\s*(\S+)/g;
const COLLABORATION_HEADER = /^【协作 (\d+)\/(\d+) · ([^\n]+)】\n\n/gm;
const COMPRESSION_NOTICE_LINE = /^【提示】[^\n]+\n\n/;

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

export function extractCollaborationSteps(text: string): AgentCollaborationStep[] {
  const steps: AgentCollaborationStep[] = [];
  const source = String(text || '');
  const pattern = new RegExp(COLLABORATION_HEADER.source, COLLABORATION_HEADER.flags);
  let match = pattern.exec(source);
  while (match) {
    steps.push({
      index: Number(match[1]),
      total: Number(match[2]),
      label: match[3].trim(),
    });
    match = pattern.exec(source);
  }
  return steps;
}

export function stripAgentStreamDecorations(text: string): string {
  return String(text || '')
    .replace(PROGRESS_LINE, '')
    .replace(COLLABORATION_HEADER, '')
    .replace(COMPRESSION_NOTICE_LINE, '')
    .trim();
}

function parseMultiAgentChain(agentSegment: string): string[] {
  return agentSegment
    .split('→')
    .map((part) => part.trim())
    .filter(Boolean);
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
    const stickyMatch = segment.match(/^继续使用：(.+)$/);
    if (stickyMatch) {
      result.agentLabel = stickyMatch[1].trim();
      result.stickyFollowUp = true;
      result.skillLabel = '—';
      result.toolsLabel = '—';
      continue;
    }
    const multiAgentMatch = segment.match(/^混合意图串行协作：(.+)$/);
    if (multiAgentMatch) {
      const chainText = multiAgentMatch[1].trim();
      result.agentLabel = chainText;
      result.multiAgentChain = parseMultiAgentChain(chainText);
      continue;
    }
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
    const chainText = line.replace(/^混合意图串行协作：/, '').split('|')[0].trim();
    result.agentLabel = chainText;
    result.multiAgentChain = parseMultiAgentChain(chainText);
  }

  return result;
}

function extractCompressionNotice(text: string): string | null {
  const match = String(text || '').match(/^【提示】[^\n]+/);
  return match ? match[0] : null;
}

export function parseAgentAssistantText(text: string): {
  routing: AgentRoutingDisplay | null;
  compressionNotice: string | null;
  collaborationSteps: AgentCollaborationStep[];
  body: string;
} {
  const collaborationSteps = extractCollaborationSteps(text);
  const withoutProgress = stripAgentStreamDecorations(text);
  const trimmed = withoutProgress.trim();
  if (!trimmed.startsWith('【路由】')) {
    return {
      routing: null,
      compressionNotice: extractCompressionNotice(trimmed),
      collaborationSteps,
      body: trimmed,
    };
  }

  const firstLineEnd = trimmed.indexOf('\n');
  const routingPayload =
    firstLineEnd === -1 ? trimmed.slice('【路由】'.length) : trimmed.slice('【路由】'.length, firstLineEnd);
  let remainder = firstLineEnd === -1 ? '' : trimmed.slice(firstLineEnd + 1).trim();
  const compressionNotice = extractCompressionNotice(remainder);
  if (compressionNotice) {
    remainder = remainder.replace(COMPRESSION_NOTICE_LINE, '').trim();
  }
  return {
    routing: parseRoutingLine(routingPayload.trim()),
    compressionNotice,
    collaborationSteps,
    body: remainder,
  };
}

/** 从助手消息路由行解析注册表 Agent 名（不含展示名括号部分）。 */
export function extractRoutedAgentNameFromText(text: string): string | null {
  const { routing } = parseAgentAssistantText(text);
  if (!routing?.agentLabel) {
    return null;
  }
  if (routing.multiAgentChain?.length) {
    return routing.multiAgentChain[0] ?? null;
  }
  const label = routing.agentLabel.trim();
  if (label.startsWith('混合意图') || label.includes('平台总路由')) {
    return null;
  }
  const registryName = label.split('（')[0].split('(')[0].trim();
  return registryName || null;
}
