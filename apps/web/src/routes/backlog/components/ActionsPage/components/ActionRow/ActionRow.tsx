import { CheckCircleIcon } from '@phosphor-icons/react';
import { useNavigate } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@stride/ui';

import { AssigneeAvatar } from '../../../components/AssigneeAvatar/AssigneeAvatar';
import { StatusPill } from '../StatusPill/StatusPill';
import { useSession } from '@providers';
import { getPriorityColorVar } from '../../../lib/priority';
import type { ActionRowProps } from './ActionRow.type';
import { getActionRowClass } from './utils/getActionRowClass';
import styles from './ActionRow.module.css';

type SessionButtonState = 'start' | 'finish' | 'swap';

function getDifficulty(action: ActionRowProps['action']) {
  if (action.difficulty) return action.difficulty;
  if (!action.estimateMin) return 'Needs estimate';
  if (action.estimateMin <= 30) return 'Tiny';
  if (action.estimateMin <= 60) return 'Small';
  if (action.estimateMin <= 120) return 'Medium';
  return 'Large';
}

function formatMinutes(minutes?: number) {
  return minutes ? `${minutes}m` : '—';
}

function getLoggedSummary(action: ActionRowProps['action']) {
  if (!action.estimateMin && !action.loggedMin) return 'No estimate';
  if (!action.estimateMin) return `${formatMinutes(action.loggedMin)} logged`;
  return `${formatMinutes(action.loggedMin)} / ${formatMinutes(action.estimateMin)}`;
}

export function ActionRow({ action, scope, view }: ActionRowProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { phase, running, requestEnd, startSession, switchSession } = useSession();
  const isRunningThis = running?.target.actionId === action.id;
  const hasActiveSession = phase !== 'idle';
  const canStart = !action.done;

  const sessionTarget = {
    title: action.title,
    sourceKey: action.spec.sourceKey,
    estimateMin: action.estimateMin,
    specId: action.spec.id,
    actionId: action.id,
  };

  const openFocusedAction = () => {
    void navigate({
      to: '/backlog/specs/$specId',
      params: { specId: action.spec.id },
      search: { actionId: action.id },
    });
  };

  const handleSessionButton = () => {
    if (isRunningThis) {
      requestEnd();
      return;
    }

    if (hasActiveSession) {
      switchSession(sessionTarget);
      return;
    }

    startSession(sessionTarget);
  };

  const sessionButtonState: SessionButtonState = isRunningThis
    ? 'finish'
    : hasActiveSession
      ? 'swap'
      : 'start';

  return (
    <article
      className={getActionRowClass(scope, view)}
      onClick={openFocusedAction}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openFocusedAction();
        }
      }}
      role="link"
      tabIndex={0}
      style={
        {
          '--row-priority-color': getPriorityColorVar(action.spec),
        } as CSSProperties
      }
    >
      <div className={styles.actionRowTitle}>
        {view === 'completed' ? (
          <span className={styles.completionMark} aria-hidden="true">
            <CheckCircleIcon size={18} weight="fill" />
          </span>
        ) : null}
        <span className={styles.actionTitleCopy}>
          <span>{action.title}</span>
          <span className={styles.actionSpecId}>{action.spec.sourceKey}</span>
        </span>
      </div>
      <span className={styles.actionPriorityCell}>
        <span className={styles.actionPriority}>{action.spec.sourcePriority}</span>
      </span>
      {scope === 'team' ? (
        <div className={styles.ownerCell}>
          <AssigneeAvatar
            name={action.assignee === 'Unassigned' ? undefined : action.assignee}
          />
          <span>{action.assignee}</span>
        </div>
      ) : null}
      <span className={styles.effortCell}>
        <span className={styles.effortDifficulty}>{getDifficulty(action)}</span>
        <span className={styles.effortMeta}>{getLoggedSummary(action)}</span>
      </span>
      <span className={styles.statusCell}>
        <StatusPill action={action} />
      </span>
      {view === 'completed' ? null : (
        <span className={styles.actionRowCtas}>
          {view === 'blocked' ? (
            action.isMine ? (
              <Button
                className={styles.nudgeActionButton}
                size="sm"
                variant="secondary"
                onClick={event => event.stopPropagation()}
              >
                {t('backlog.actionRow.nudge')}
              </Button>
            ) : (
              <span className={styles.actionCtaPlaceholder} aria-hidden="true" />
            )
          ) : action.isMine ? (
            <>
              <Button
                className={`${styles.sessionActionButton} ${styles[sessionButtonState]}`}
                size="sm"
                variant="primary"
                disabled={!canStart}
                onClick={event => {
                  event.stopPropagation();
                  handleSessionButton();
                }}
              >
                {t(`backlog.actionRow.session.${sessionButtonState}`)}
              </Button>
            </>
          ) : (
            <span className={styles.actionCtaPlaceholder} aria-hidden="true" />
          )}
        </span>
      )}
    </article>
  );
}
