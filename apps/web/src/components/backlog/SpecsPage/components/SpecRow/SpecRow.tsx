import { CaretRightIcon } from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { AssigneeAvatar } from '../../../components/AssigneeAvatar/AssigneeAvatar';
import { getPriorityColorVar } from '../../../lib/priority';
import type { SpecRowProps } from './SpecRow.type';
import styles from './SpecRow.module.css';

export function SpecRow({ spec }: SpecRowProps) {
  const { t } = useTranslation();

  return (
    <article
      className={styles.specRowShell}
      style={{ '--row-priority-color': getPriorityColorVar(spec) } as CSSProperties}
    >
      <Link
        className={styles.specRow}
        to="/specs/$specId"
        params={{ specId: spec.id }}
        search={{ actionId: undefined }}
      >
        <code className={styles.specKey}>{spec.sourceKey}</code>
        <div className={styles.specTitle}>{spec.title}</div>
        <span className={styles.priorityText}>{spec.sourcePriority}</span>
        <AssigneeAvatar name={spec.assignee} />
        <span className={styles.specActionCount}>
          {spec.actions.length > 0
            ? t('backlog.specRow.actionsCount', { count: spec.actions.length })
            : t('backlog.specRow.noActions')}
        </span>
        <span className={styles.openIcon} aria-hidden="true">
          <CaretRightIcon size={14} weight="bold" />
        </span>
      </Link>
    </article>
  );
}
