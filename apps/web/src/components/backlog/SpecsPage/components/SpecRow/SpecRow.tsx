import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AssigneeAvatar } from '../../../components/AssigneeAvatar/AssigneeAvatar';
import { getPriorityColorVar } from '../../../lib/priority';
import type { SpecRowProps } from './SpecRow.type';
import styles from '../../../../backlog.module.css';

export function SpecRow({ spec }: SpecRowProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(
    spec.actions.length > 0 && spec.id === 'spec-2',
  );

  return (
    <article
      className={styles.specRowShell}
      style={{ '--row-priority-color': getPriorityColorVar(spec) } as CSSProperties}
    >
      <button className={styles.specRow} onClick={() => setIsExpanded(open => !open)}>
        <span className={styles.expandIcon}>{isExpanded ? '⌄' : '›'}</span>
        <code className={styles.specKey}>{spec.sourceKey}</code>
        <div className={styles.specTitle}>{spec.title}</div>
        <span className={styles.priorityText}>{spec.sourcePriority}</span>
        <AssigneeAvatar name={spec.assignee} />
        <span className={styles.specActionCount}>
          {spec.actions.length > 0
            ? t('backlog.specRow.actionsCount', { count: spec.actions.length })
            : t('backlog.specRow.noActions')}
        </span>
      </button>
      {isExpanded ? (
        <div className={styles.actionTable}>
          {spec.actions.length > 0 ? (
            spec.actions.map(action => (
              <div key={action.id} className={styles.actionCompactRow}>
                <div className={styles.actionCompactCopy}>
                  <AssigneeAvatar name={action.assignee ?? spec.assignee} />
                  <span className={styles.actionCompactTitle}>{action.title}</span>
                  <span className={styles.actionCompactMeta}>
                    {spec.sourcePriority} · {action.done ? t('backlog.specRow.done') : t('backlog.specRow.open')}
                  </span>
                </div>
                <span className={styles.actionSegmentedCtas}>
                  <button>{t('backlog.specRow.schedule')}</button>
                  {(action.assignee ?? spec.assignee) === 'You' ? (
                    <button>{t('backlog.specRow.start')}</button>
                  ) : null}
                  <button>
                    {(action.assignee ?? spec.assignee)
                      ? t('backlog.specRow.assign')
                      : t('backlog.specRow.claim')}
                  </button>
                </span>
              </div>
            ))
          ) : (
            <button className={styles.addActionButton}>{t('backlog.specRow.addFirstAction')}</button>
          )}
        </div>
      ) : null}
    </article>
  );
}
