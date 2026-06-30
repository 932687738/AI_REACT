import { describe, expect, it } from 'vitest';
import {
  extractCollaborationSteps,
  parseAgentAssistantText,
  stripAgentStreamDecorations,
} from './agentChatDisplay';

describe('agentChatDisplay', () => {
  it('parses sticky follow-up routing without skill/tools rows', () => {
    const text = '【路由】继续使用：customer-service（客服）\n\n退款进度如下…';
    const parsed = parseAgentAssistantText(text);
    expect(parsed.routing?.stickyFollowUp).toBe(true);
    expect(parsed.routing?.agentLabel).toBe('customer-service（客服）');
    expect(parsed.body).toBe('退款进度如下…');
  });

  it('parses multi-agent routing chain', () => {
    const text =
      '【路由】混合意图串行协作：customer-service → data-analysis | Skill：无 | 工具：子 Agent 内置能力\n\n';
    const parsed = parseAgentAssistantText(text);
    expect(parsed.routing?.multiAgentChain).toEqual(['customer-service', 'data-analysis']);
  });

  it('strips collaboration headers and extracts steps', () => {
    const text =
      '【协作 1/2 · 客服】\n\n第一段\n\n【协作 2/2 · 分析】\n\n第二段';
    expect(extractCollaborationSteps(text)).toEqual([
      { index: 1, total: 2, label: '客服' },
      { index: 2, total: 2, label: '分析' },
    ]);
    expect(stripAgentStreamDecorations(text)).toBe('第一段\n\n第二段');
  });

  it('extracts compression notice after routing', () => {
    const text =
      '【路由】智能体：平台总路由\n\n【提示】输入较长，已用小模型生成摘要供本轮路由使用；细节可能需您补充。\n\n正文';
    const parsed = parseAgentAssistantText(text);
    expect(parsed.compressionNotice).toContain('输入较长');
    expect(parsed.body).toBe('正文');
  });
});
