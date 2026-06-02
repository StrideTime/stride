import { CheckCircleIcon, XIcon } from '@phosphor-icons/react';
import { Badge, Button, Typography } from '@stride/ui';
import { useTranslation } from 'react-i18next';

import { INBOX_TYPE_TONES } from '../inbox.constants';
import type { InboxNotification } from '../inbox.mock';
import { getDetailEventText } from '../utils/inboxFilters';
import styles from '../InboxView.module.css';

type InboxDetailProps = {
  item: InboxNotification;
  onClose: () => void;
};

export function InboxDetail({ item, onClose }: InboxDetailProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.modalLayer}>
      <button
        aria-label={t('inbox.detail.closeAria')}
        className={styles.modalScrim}
        onClick={onClose}
        type="button"
      />
      <aside
        className={styles.modal}
        aria-label={t('inbox.detail.selectedAria')}
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <div className={styles.detailMeta}>
            <span className={styles.sourceKey}>{item.sourceKey}</span>
            <Badge variant={INBOX_TYPE_TONES[item.type]}>{item.summary}</Badge>
            <span>{item.timestamp}</span>
          </div>
          <button
            aria-label={t('inbox.detail.closeAria')}
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <XIcon size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.specContext}>
            <Typography size="xs" color="muted" weight="semibold">
              {t('inbox.detail.spec')}
            </Typography>
            <Typography as="h2" size="lg" weight="bold">{item.title}</Typography>
          </div>
          <div className={styles.detailCallout}>
            <span className={styles.detailCalloutIcon} aria-hidden="true">
              <CheckCircleIcon size={18} weight="bold" />
            </span>
            <div className={styles.detailCalloutCopy}>
              <Typography weight="semibold">{getDetailEventText(item, t)}</Typography>
              <Typography size="sm" color="muted">{item.detail}</Typography>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary">{t('inbox.detail.openSpec')}</Button>
        </div>
      </aside>
    </div>
  );
}
