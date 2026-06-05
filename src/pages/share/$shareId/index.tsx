import { useEffect, useState } from 'react';
import { useIntl, useParams } from '@umijs/max';
import { Spin, Typography } from 'antd';
import { loadConversationShare, type ShareDetail } from '@/services/conversationShareService';
import styles from './index.less';

export default function ConversationSharePage() {
  const intl = useIntl();
  const { shareId = '' } = useParams<{ shareId: string }>();
  const [detail, setDetail] = useState<ShareDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    void loadConversationShare(shareId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Spin tip={intl.formatMessage({ id: 'chat.share.loading' })} />
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div className={styles.page}>
        <Typography.Title level={4}>{intl.formatMessage({ id: 'chat.share.notFound' })}</Typography.Title>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Typography.Title level={3}>{detail.title || intl.formatMessage({ id: 'chat.share.pageTitle' })}</Typography.Title>
      </header>
      <div className={styles.thread}>
        {detail.groups.flatMap((group) =>
          group.messages.map((message, index) => (
            <article
              key={`${group.groupIndex}-${index}`}
              className={`${styles.messageRow} ${message.role === 'user' ? styles.messageRowUser : ''}`}
            >
              <div
                className={`${styles.bubble} ${
                  message.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant
                }`}
              >
                {message.text}
              </div>
            </article>
          )),
        )}
      </div>
    </div>
  );
}
