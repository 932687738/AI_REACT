import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import type { InputRef } from 'antd';
import { useEffect, useRef } from 'react';
import { useIntl } from '@umijs/max';
import styles from './ConversationSearchBox.less';

interface ConversationSearchBoxProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function ConversationSearchBox({
  value,
  disabled = false,
  onChange,
  onClear,
}: ConversationSearchBoxProps) {
  const intl = useIntl();
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && value) {
        event.preventDefault();
        onClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear, value]);

  return (
    <div className={styles.wrap}>
      <Input
        ref={inputRef}
        size="small"
        allowClear
        disabled={disabled}
        prefix={<SearchOutlined aria-hidden className={styles.icon} />}
        placeholder={intl.formatMessage({ id: 'layout.search.placeholder' })}
        aria-label={intl.formatMessage({ id: 'layout.search.placeholder' })}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClear={onClear}
        className={styles.input}
      />
    </div>
  );
}
