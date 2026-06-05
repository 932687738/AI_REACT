import { LinkOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Checkbox, message } from 'antd';
import { createConversationShare } from '@/services/conversationShareService';
import styles from './index.less';

interface ConversationShareBarProps {
  conversationId: string;
  groupIds: string[];
  selectedGroupIds: Set<string>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onCancel: () => void;
}

export default function ConversationShareBar({
  conversationId,
  groupIds,
  selectedGroupIds,
  onSelectAll,
  onClearSelection,
  onCancel,
}: ConversationShareBarProps) {
  const intl = useIntl();
  const selectedCount = selectedGroupIds.size;
  const allSelected = groupIds.length > 0 && selectedCount === groupIds.length;
  const indeterminate = selectedCount > 0 && !allSelected;

  const handleCreateLink = async () => {
    if (selectedCount === 0) {
      return;
    }
    try {
      const result = await createConversationShare(conversationId, {
        groupIds: Array.from(selectedGroupIds),
      });
      const absoluteUrl = `${window.location.origin}${result.url}`;
      await navigator.clipboard.writeText(absoluteUrl);
      message.success(intl.formatMessage({ id: 'chat.share.linkCopied' }));
      onCancel();
    } catch {
      message.error(intl.formatMessage({ id: 'chat.share.createFailed' }));
    }
  };

  return (
    <div
      className={`${styles.bar} nebula-share-bar`}
      role="toolbar"
      aria-label={intl.formatMessage({ id: 'chat.share.toolbar' })}
    >
      <Checkbox
        checked={allSelected}
        indeterminate={indeterminate}
        onChange={(event) => {
          if (event.target.checked) {
            onSelectAll();
          } else {
            onClearSelection();
          }
        }}
      >
        {intl.formatMessage({ id: 'chat.share.selectAll' })}
      </Checkbox>
      <span className={styles.count}>
        {intl.formatMessage({ id: 'chat.share.selectedCount' }, { count: selectedCount })}
      </span>
      <div className={styles.actions}>
        <Button type="text" onClick={onCancel}>
          {intl.formatMessage({ id: 'chat.share.cancel' })}
        </Button>
        <Button
          type="primary"
          icon={<LinkOutlined aria-hidden />}
          disabled={selectedCount === 0}
          onClick={() => void handleCreateLink()}
        >
          {intl.formatMessage({ id: 'chat.share.createLink' })}
        </Button>
      </div>
    </div>
  );
}
