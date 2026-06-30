import type { FlowNodeData } from '@/types/flowManagement';

export interface FlowNodeCatalogItem {
  type: string;
  labelKey: string;
  defaultLabel: string;
  description: string;
  singleton?: boolean;
  defaultData: FlowNodeData;
}

/** 与 design §4.2 v1 内置节点类型一致（start/end 单独处理）。 */
export const FLOW_NODE_CATALOG: FlowNodeCatalogItem[] = [
  {
    type: 'ai',
    labelKey: 'flowDesigner.node.ai',
    defaultLabel: 'AI 对话',
    description: '调用 LLM 生成回答',
    defaultData: {
      systemPrompt: '你是助手',
      userPromptTemplate: '{{question}}',
      retry: { maxAttempts: 2, backoffMs: 1000 },
    },
  },
  {
    type: 'knowledge',
    labelKey: 'flowDesigner.node.knowledge',
    defaultLabel: '知识库',
    description: 'RAG 检索并注入上下文',
    defaultData: {
      knowledgeBaseId: 0,
      queryTemplate: '{{question}}',
      retry: { maxAttempts: 2, backoffMs: 1000 },
    },
  },
  {
    type: 'classifier',
    labelKey: 'flowDesigner.node.classifier',
    defaultLabel: '意图分类',
    description: '单轮 LLM 分类',
    defaultData: {
      categories: 'general,support,billing',
      inputTemplate: '{{question}}',
    },
  },
  {
    type: 'branch',
    labelKey: 'flowDesigner.node.branch',
    defaultLabel: '分支',
    description: '条件表达式写入变量',
    defaultData: { expression: '{{branchResult}}' },
  },
  {
    type: 'script',
    labelKey: 'flowDesigner.node.script',
    defaultLabel: '脚本',
    description: 'Groovy 沙箱执行',
    defaultData: { script: 'return [ok: true]', timeoutSeconds: 30 },
  },
  {
    type: 'http',
    labelKey: 'flowDesigner.node.http',
    defaultLabel: 'HTTP',
    description: '调用外部 HTTP API',
    defaultData: {
      url: 'https://api.example.com/data',
      method: 'GET',
      bodyTemplate: '',
      retry: { maxAttempts: 2, backoffMs: 1000 },
    },
  },
  {
    type: 'subflow',
    labelKey: 'flowDesigner.node.subflow',
    defaultLabel: '子流程',
    description: '调用已发布子流程',
    defaultData: { subflowId: 0 },
  },
  {
    type: 'reply',
    labelKey: 'flowDesigner.node.reply',
    defaultLabel: '回复',
    description: '写入最终回复',
    defaultData: { messageTemplate: '{{ai_1.text}}' },
  },
];

export const FLOW_START_NODE: FlowNodeCatalogItem = {
  type: 'start',
  labelKey: 'flowDesigner.node.start',
  defaultLabel: '开始',
  description: '流程入口',
  singleton: true,
  defaultData: {},
};

export const FLOW_END_NODE: FlowNodeCatalogItem = {
  type: 'end',
  labelKey: 'flowDesigner.node.end',
  defaultLabel: '结束',
  description: '流程出口',
  singleton: false,
  defaultData: {},
};

export function catalogByType(type: string): FlowNodeCatalogItem | undefined {
  if (type === 'start') {
    return FLOW_START_NODE;
  }
  if (type === 'end') {
    return FLOW_END_NODE;
  }
  return FLOW_NODE_CATALOG.find((item) => item.type === type);
}

export function defaultDataForType(type: string): FlowNodeData {
  return { ...(catalogByType(type)?.defaultData ?? {}) };
}
