import { useTranslation } from 'react-i18next';
import { Typography } from '@stride/ui';

import { ActionRow } from '../ActionRow/ActionRow';
import type { ActionListProps } from './ActionList.type';
import { getActionHeaderClass } from './utils/getActionHeaderClass';
import styles from '../../../../backlog.module.css';

export function ActionList({
  title,
  description,
  actions,
  emptyText,
  scope,
  activeView,
  onScopeChange,
}: ActionListProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.group}>
      <div className={styles.groupHeader}>
        <div>
          <Typography as="h2" size="lg" weight="semibold">
            {title}
          </Typography>
          <Typography as="p" size="sm" color="muted">
            {description}
          </Typography>
        </div>
        <div className={styles.actionListTools}>
          {activeView === 'next' ? null : (
            <div className={styles.scopeSwitch} aria-label={t('backlog.actionsList.scopeAria')}>
              <button
                className={scope === 'mine' ? styles.scopeActive : undefined}
                onClick={() => onScopeChange('mine')}
                type="button"
              >
                {t('backlog.actionsList.yourActions')}
              </button>
              <button
                className={scope === 'team' ? styles.scopeActive : undefined}
                onClick={() => onScopeChange('team')}
                type="button"
              >
                {t('backlog.actionsList.showTeam')}
              </button>
            </div>
          )}
          <span className={styles.groupCount}>{actions.length}</span>
        </div>
      </div>
      <div className={styles.actionList}>
        {actions.length > 0 ? (
          <>
            <div className={getActionHeaderClass(scope, activeView)}>
              <span>{t('backlog.actionsList.headers.action')}</span>
              <span>{t('backlog.actionsList.headers.spec')}</span>
              {scope === 'team' ? <span>{t('backlog.actionsList.headers.assignee')}</span> : null}
              <span>{t('backlog.actionsList.headers.time')}</span>
              <span className={styles.statusHeader}>{t('backlog.actionsList.headers.status')}</span>
              {activeView === 'completed' ? null : <span />}
            </div>
            {actions.map(action => (
              <ActionRow
                key={`${action.spec.id}-${action.id}`}
                action={action}
                scope={scope}
                view={activeView}
              />
            ))}
          </>
        ) : (
          <div className={styles.emptyState}>{emptyText}</div>
        )}
      </div>
    </section>
  );
}

