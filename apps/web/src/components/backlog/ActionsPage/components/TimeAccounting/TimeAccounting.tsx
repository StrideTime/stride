import { useTranslation } from 'react-i18next';

import type { TimeAccountingProps } from './TimeAccounting.type';
import styles from './TimeAccounting.module.css';

export function TimeAccounting({ action }: TimeAccountingProps) {
  const { t } = useTranslation();
  const estimate = action.estimateMin ? `${action.estimateMin}m` : '—';
  const planned = action.plannedMin ? `${action.plannedMin}m` : '—';
  const logged = action.loggedMin ? `${action.loggedMin}m` : '—';

  return (
    <span className={styles.timeCell} aria-label={t('backlog.timeAccounting.aria')}>
      <span>
        <strong>{estimate}</strong> {t('backlog.timeAccounting.estimate')}
      </span>
      <span>
        <strong>{planned}</strong> {t('backlog.timeAccounting.planned')}
      </span>
      <span>
        <strong>{logged}</strong> {t('backlog.timeAccounting.logged')}
      </span>
    </span>
  );
}
