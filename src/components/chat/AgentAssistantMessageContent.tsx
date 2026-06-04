import { useMemo } from 'react';
import { useIntl } from '@umijs/max';
import AgentProgressTimeline from '@/components/chat/AgentProgressTimeline';
import AgentRoutingMeta from '@/components/chat/AgentRoutingMeta';
import KnowledgeCitationPanel from '@/components/chat/KnowledgeCitationPanel';
import TypewriterText from '@/components/chat/TypewriterText';
import type { ConversationMessage, KnowledgeCitation } from '@/openapi/typings';
import { extractProgressFromText, parseAgentAssistantText } from '@/utils/agentChatDisplay';
import styles from './ChatShell/index.less';

export interface AgentAssistantMessageContentProps {
  item: ConversationMessage;
  scrollToBottom: () => void;
  onCitationNavigate: (citation: KnowledgeCitation) => void;
}

export default function AgentAssistantMessageContent({
  item,
  scrollToBottom,
  onCitationNavigate,
}: AgentAssistantMessageContentProps) {
  const intl = useIntl();

  const { routing, body } = useMemo(
    () => parseAgentAssistantText(item.text || ''),
    [item.text],
  );

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

  return (
    <>
      {routing ? <AgentRoutingMeta routing={routing} /> : null}
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
