import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from '@umijs/max';
import type { ChatUserMessageNavItem } from '@/utils/chatUserMessageNav';
import styles from './index.less';

export type { ChatUserMessageNavItem };

/** 与 BasicLayout .header 高度一致 */
const MAIN_HEADER_HEIGHT_PX = 56;

export interface ChatSuggestRailProps {
  items: ChatUserMessageNavItem[];
  activeMessageId?: string | null;
  onNavigate: (messageId: string) => void;
}

export default function ChatSuggestRail({
  items,
  activeMessageId = null,
  onNavigate,
}: ChatSuggestRailProps) {
  const intl = useIntl();
  const [hovered, setHovered] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const visibleItems = useMemo(() => items.filter((item) => item.label.trim()), [items]);

  const activeIndex = useMemo(() => {
    if (activeMessageId) {
      const index = visibleItems.findIndex((item) => item.id === activeMessageId);
      if (index >= 0) {
        return index;
      }
    }
    return Math.max(0, visibleItems.length - 1);
  }, [activeMessageId, visibleItems]);

  useEffect(() => {
    if (!hovered) {
      return;
    }
    const activeItem = listRef.current?.children.item(activeIndex) as HTMLElement | null;
    activeItem?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, hovered, visibleItems.length]);

  const handleNavigate = (messageId: string) => {
    onNavigate(messageId);
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHovered(true);
  };

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setHovered(false);
      leaveTimerRef.current = null;
    }, 160);
  };

  useEffect(
    () => () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    },
    [],
  );

  if (!visibleItems.length || typeof document === 'undefined') {
    return null;
  }

  const rail = (
    <div
      className={`${styles.rail} nebula-chat-suggest-rail ${hovered ? styles.railHovered : ''}`}
      style={{ top: MAIN_HEADER_HEIGHT_PX }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.hitStrip} aria-hidden />
      <div className={styles.railDock}>
        <aside
          className={styles.panel}
          aria-label={intl.formatMessage({ id: 'chat.suggestRail.label' })}
          aria-hidden={!hovered}
        >
          <p className={styles.panelTitle}>{intl.formatMessage({ id: 'chat.suggestRail.title' })}</p>
          <ul ref={listRef} className={styles.list}>
            {visibleItems.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`${styles.item} ${index === activeIndex ? styles.itemActive : ''}`}
                  title={item.label}
                  tabIndex={hovered ? 0 : -1}
                  onClick={() => handleNavigate(item.id)}
                >
                  <span className={styles.itemText}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );

  return createPortal(rail, document.body);
}
