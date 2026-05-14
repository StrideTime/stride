import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@stride/ui';

import { AssigneeAvatar } from '../../../components/AssigneeAvatar/AssigneeAvatar';
import { StatusPill } from '../StatusPill/StatusPill';
import { TimeAccounting } from '../TimeAccounting/TimeAccounting';
import { getPriorityColorVar } from '../../../lib/priority';
import type { ActionRowProps } from './ActionRow.type';
import { getActionRowClass } from './utils/getActionRowClass';
import styles from '../../../../backlog.module.css';

export function ActionRow({ action, scope, view }: ActionRowProps) {
  const { t } = useTranslation();

  return (
    <article
      className={getActionRowClass(scope, view)}
      style={
        {
          '--row-priority-color': getPriorityColorVar(action.spec),
        } as CSSProperties
      }
    >
      <div className={styles.actionRowTitle}>
        <span className={styles.actionPriority}>{action.spec.sourcePriority}</span>
        <span>{action.title}</span>
      </div>
      <code className={styles.actionSpecId}>{action.spec.sourceKey}</code>
      {scope === 'team' ? (
        <div className={styles.ownerCell}>
          <AssigneeAvatar
            name={action.assignee === 'Unassigned' ? undefined : action.assignee}
          />
          <span>{action.assignee}</span>
        </div>
      ) : null}
      <TimeAccounting action={action} />
      <span className={styles.statusCell}>
        <StatusPill action={action} />
      </span>
      {view === 'completed' ? (
        <span className={styles.actionCtaPlaceholder} aria-hidden="true" />
      ) : (
        <span className={styles.actionRowCtas}>
          {view === 'blocked' ? (
            action.isMine ? (
              <Button className={styles.nudgeActionButton} size="sm" variant="secondary">
                {t('backlog.actionRow.nudge')}
              </Button>
            ) : (
              <span className={styles.actionCtaPlaceholder} aria-hidden="true" />
            )
          ) : action.isMine ? (
            <>
              <Button className={styles.startActionButton} size="sm" variant="primary">
                {t('backlog.actionRow.start')}
              </Button>
              <Button size="sm" variant="secondary">{t('backlog.actionRow.schedule')}</Button>
            </>
          ) : (
            <span className={styles.actionCtaPlaceholder} aria-hidden="true" />
          )}
        </span>
      )}
    </article>
  );
}
