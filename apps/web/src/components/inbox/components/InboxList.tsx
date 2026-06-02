import { useTranslation } from 'react-i18next';

import type { InboxNotification } from '../inbox.mock';
import styles from '../InboxView.module.css';
import { InboxRow } from './InboxRow';

type InboxListProps = {
  items: InboxNotification[];
  onItemSelect: (id: string) => void;
  selectedItemId: string | null;
};

export function InboxList({ items, onItemSelect, selectedItemId }: InboxListProps) {
  const { t } = useTranslation();

  if (!items.length) {
    return <div className={styles.emptyState}>{t('inbox.empty.view')}</div>;
  }

  return (
    <div className={styles.inboxList}>
      {items.map(item => (
        <InboxRow
          key={item.id}
          item={item}
          onSelect={selected => onItemSelect(selected.id)}
          selected={item.id === selectedItemId}
        />
      ))}
    </div>
  );
}
