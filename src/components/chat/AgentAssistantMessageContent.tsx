import { useMemo } from 'react';
import { useIntl } from '@umijs/max';
import AgentCollaborationTimeline from '@/components/chat/AgentCollaborationTimeline';
import MemoryRecallMeta from '@/components/chat/MemoryRecallMeta';
import AgentProgressTimeline from '@/components/chat/AgentProgressTimeline';
import AgentRoutingMeta from '@/components/chat/AgentRoutingMeta';
import KnowledgeCitationPanel from '@/components/chat/KnowledgeCitationPanel';
import TypewriterText from '@/components/chat/TypewriterText';
import ArtifactRenderer from '@/components/artifacts/ArtifactRenderer';
import type { ConversationMessage, KnowledgeCitation } from '@/openapi/typings';
import type { ChatArtifactPayload } from '@/utils/SuperAgentSse';
import { extractProgressFromText, parseAgentAssistantText } from '@/utils/agentChatDisplay';
import styles from './ChatShell/index.less';

export interface AgentAssistantMessageContentProps {
  item: ConversationMessage;
  scrollToBottom: () => void;
  onCitationNavigate: (citation: KnowledgeCitation) => void;
  onSendUserMessage?: (message: string) => void;
}

export default function AgentAssistantMessageContent({
  item,
  scrollToBottom,
  onCitationNavigate,
  onSendUserMessage,
}: AgentAssistantMessageContentProps) {
  const intl = useIntl();

  const { routing, compressionNotice, collaborationSteps, body } = useMemo(() => {
    const parsed = parseAgentAssistantText(item.text || '');
    if (!parsed.routing) {
      return parsed;
    }
    const modelName = (item.meta as { modelName?: string } | undefined)?.modelName;
    const routingModelName = (item.meta as { routingModelName?: string } | undefined)?.routingModelName;
    if (!parsed.routing.modelLabel && modelName) {
      return {
        ...parsed,
        routing: {
          ...parsed.routing,
          modelLabel: modelName,
          routingModelLabel: routingModelName,
        },
      };
    }
    return parsed;
  }, [item.text, item.meta]);

  const progressSteps = useMemo(() => {
    const structured = item.agentProgress ?? [];
    if (structured.length) {
      return structured;
    }
    return extractProgressFromText(item.text || '');
  }, [item.agentProgress, item.text]);

  const showProgress = progressSteps.length > 0;
  const hasBody = Boolean(body.trim());
  const compactProgress = showProgress && hasBody && !item.pending;

  const artifacts = (item.meta?.artifacts || []) as unknown as ChatArtifactPayload[];

  const memoryLongCount = (item.meta as { memoryLongCount?: number } | undefined)?.memoryLongCount;
  const memoryShortCount = (item.meta as { memoryShortCount?: number } | undefined)?.memoryShortCount;

  return (
    <>
      {routing ? <AgentRoutingMeta routing={routing} /> : null}
      <MemoryRecallMeta longCount={memoryLongCount} shortCount={memoryShortCount} />
      {compressionNotice ? (
        <p className={styles.meta} role="note">
          {compressionNotice.replace(/^【提示】/, '')}
        </p>
      ) : null}
      {collaborationSteps.length ? (
        <AgentCollaborationTimeline steps={collaborationSteps} />
      ) : null}
      {artifacts.length ? (
        <ArtifactRenderer
          artifacts={artifacts}
          onSqlConfirm={() => onSendUserMessage?.('确认执行')}
          onSqlRevise={() => onSendUserMessage?.('修改：请补充筛选条件')}
        />
      ) : null}
      {showProgress ? (
        <AgentProgressTimeline steps={progressSteps} compact={compactProgress} />
      ) : null}
      {hasBody || item.pending ? (
        <TypewriterText text={body} active={Boolean(item.pending)} onReveal={scrollToBottom} />
      ) : null}
      {item.meta?.knowledgeBaseCount ? (
        <div className={styles.meta}>
          {intl.formatMessage(
            { id: 'chat.kbSourcesLabel' },
            { count: item.meta.knowledgeBaseCount },
          )}
          {item.meta.knowledgeBaseNames?.length
            ? `: ${item.meta.knowledgeBaseNames.join(', ')}`
            : ''}
        </div>
      ) : null}
      {item.meta?.citations?.length ? (
        <KnowledgeCitationPanel
          citations={item.meta.citations}
          onCitationClick={onCitationNavigate}
        />
      ) : null}
    </>
  );
}
