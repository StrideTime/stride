import { CaretRightIcon } from '@phosphor-icons/react';
import { Badge, Typography } from '@stride/ui';
import { useTranslation } from 'react-i18next';

import { INBOX_TYPE_TONES } from '../inbox.constants';
import type { InboxNotification } from '../inbox.mock';
import styles from '../InboxView.module.css';

type InboxRowProps = {
  item: InboxNotification;
  selected: boolean;
  onSelect: (item: InboxNotification) => void;
};

export function InboxRow({ item, selected, onSelect }: InboxRowProps) {
  const { t } = useTranslation();
  const className = [
    styles.inboxRow,
    item.unread ? styles.unreadRow : undefined,
    selected ? styles.selectedRow : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      aria-label={t('inbox.row.openAria', { title: item.title })}
      className={className}
      onClick={() => onSelect(item)}
      type="button"
    >
      <div className={styles.unreadDot} aria-hidden="true" />
      <span className={styles.sourceKey}>{item.sourceKey}</span>
      <div className={styles.rowCopy}>
        <Typography className={styles.changeLine} weight="semibold">
          {item.detail}
        </Typography>
        <div className={styles.contextLine}>
          <Badge variant={INBOX_TYPE_TONES[item.type]}>{item.summary}</Badge>
          <span>{item.title}</span>
        </div>
      </div>
      <span className={styles.timestamp}>{item.timestamp}</span>
      <CaretRightIcon className={styles.rowChevron} size={16} weight="bold" aria-hidden="true" />
    </button>
  );
}
