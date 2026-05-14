import { UserCirclePlus } from '@phosphor-icons/react';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AssigneeAvatar } from '../../../components/AssigneeAvatar/AssigneeAvatar';
import { getPriorityColorVar } from '../../../lib/priority';
import type { SpecRowProps } from './SpecRow.type';
import styles from './SpecRow.module.css';

export function SpecRow({ spec }: SpecRowProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(
    spec.actions.length > 0 && spec.id === 'spec-2',
  );
  const isMine = spec.assignee === 'You';
  const isUnassigned = !spec.assignee;
  const canBreakDown = isMine || isUnassigned;

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
          {isUnassigned ? (
            <div className={styles.claimBanner}>
              <span className={styles.claimGlyph}>
                <UserCirclePlus size={18} weight="bold" />
              </span>
              <span className={styles.claimCopy}>{t('backlog.specRow.unassignedPrompt')}</span>
              <button>{t('backlog.specRow.claim')}</button>
            </div>
          ) : null}
          {canBreakDown && spec.actions.length === 0 ? (
            <button className={styles.emptyBreakdownPanel} type="button">
              <span className={styles.breakdownGlyph}>＋</span>
              <span className={styles.breakdownCopy}>
                <strong>{t('backlog.specRow.breakDown')}</strong>
                <span>{t('backlog.specRow.breakdownPrompt')}</span>
              </span>
            </button>
          ) : null}
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
                {(action.assignee ?? spec.assignee) === 'You' ? (
                  <span className={styles.actionSegmentedCtas}>
                    <button>{t('backlog.specRow.schedule')}</button>
                    <button>{t('backlog.specRow.start')}</button>
                    <button>{t('backlog.specRow.assign')}</button>
                  </span>
                ) : null}
              </div>
            ))
          ) : null}
          {canBreakDown && spec.actions.length > 0 ? (
            <button className={styles.addActionFooterButton}>{t('backlog.specRow.addAction')}</button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
