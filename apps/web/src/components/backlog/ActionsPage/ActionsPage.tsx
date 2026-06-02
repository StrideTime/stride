import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SmileyIcon, SmileyMehIcon, SmileySadIcon, TargetIcon, TrashIcon } from '@phosphor-icons/react';

import { Button, Typography } from '@stride/ui';

import { useSession, type Feeling } from '../../session';
import { useSpecs } from '../../specs';
import { ActionList } from './components/ActionList/ActionList';
import { Controls } from '../components/Controls/Controls';
import { Header } from '../components/Header/Header';
import { defaultBacklogFilters, getVisibleActions } from '../lib/backlogFilters';
import { getViewCopy } from '../lib/viewCopy';
import type { ActionScope, BacklogView } from '../types';
import styles from './ActionsPage.module.css';

const FEELING_OPTIONS: ReadonlyArray<{
  value: Feeling;
  label: string;
  icon: typeof SmileyIcon;
  className: string;
}> = [
  { value: 'frown', label: 'Tough', icon: SmileySadIcon, className: 'feelingTough' },
  { value: 'neutral', label: 'Okay', icon: SmileyMehIcon, className: 'feelingOkay' },
  { value: 'smile', label: 'Good', icon: SmileyIcon, className: 'feelingGood' },
  { value: 'target', label: 'On point', icon: TargetIcon, className: 'feelingOnPoint' },
];

export function ActionsPage() {
  const { t } = useTranslation();
  const { specs } = useSpecs();
  const [activeView, setActiveView] = useState<BacklogView>('next');
  const [actionScope, setActionScope] = useState<ActionScope>('mine');
  const viewCopy = getViewCopy(t, activeView);
  const effectiveActionScope = activeView === 'next' ? 'mine' : actionScope;
  const actionRows = useMemo(
    () => getVisibleActions(specs, activeView, effectiveActionScope, defaultBacklogFilters),
    [specs, activeView, effectiveActionScope],
  );

  return (
    <section className={styles.page}>
      <Header surface="actions" />
      <Controls
        surface="actions"
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className={styles.pipeline}>
        <ActionList
          actions={actionRows}
          emptyText={viewCopy.empty}
          scope={effectiveActionScope}
          activeView={activeView}
          onScopeChange={setActionScope}
        />
      </div>
      <SessionCheckInDialog />
    </section>
  );
}

function SessionCheckInDialog() {
  const { phase, running, elapsedMs, completeSession, discardSession } = useSession();
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [note, setNote] = useState('');
  const [markedDone, setMarkedDone] = useState(false);

  if (phase !== 'checkin' || !running) return null;

  const minutes = Math.max(1, Math.round(elapsedMs / 60000));
  const durationLabel = minutes === 1 ? '1 minute logged' : `${minutes} minutes logged`;
  const hasFeedback = feeling !== null || note.trim().length > 0 || markedDone;
  const finishCheckIn = () => completeSession({
    feeling: feeling ?? 'neutral',
    note,
    markedDone,
  });

  return (
    <div className={styles.checkInOverlay} role="presentation" onClick={finishCheckIn}>
      <section
        className={styles.checkInDialog}
        aria-label="Session check-in"
        onClick={event => event.stopPropagation()}
      >
        <button
          className={styles.checkInClose}
          type="button"
          aria-label="Close feedback"
          onClick={finishCheckIn}
        >
          ×
        </button>
        <div className={styles.checkInHead}>
          <Typography as="h2" size="lg" weight="bold">
            Anything to add?
          </Typography>
          <Typography as="p" size="sm" color="muted">
            {running.target.title}
          </Typography>
          <span className={styles.sessionDuration}>{durationLabel}</span>
        </div>

        <div className={styles.feelingScale} aria-label="Session feeling">
          {FEELING_OPTIONS.map(item => {
            const Icon = item.icon;
            const selected = feeling === item.value;
            return (
              <button
                key={item.value}
                className={[
                  styles.feelingOption,
                  styles[item.className],
                  selected ? styles.feelingSelected : null,
                ].filter(Boolean).join(' ')}
                onClick={() => setFeeling(item.value)}
                type="button"
                aria-pressed={selected}
              >
                <Icon size={18} weight={selected ? 'fill' : 'regular'} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <textarea
          className={styles.checkInNote}
          onChange={event => setNote(event.target.value)}
          placeholder="Add a note if anything changed."
          rows={3}
          value={note}
        />

        <div className={styles.completionRow}>
          <Typography as="span" size="sm" weight="semibold">
            Finished the action?
          </Typography>
          <div className={styles.doneChoice} aria-label="Action completion">
            <button
              aria-pressed={!markedDone}
              className={!markedDone ? `${styles.doneOption} ${styles.doneOptionActive}` : styles.doneOption}
              onClick={() => setMarkedDone(false)}
              type="button"
            >
              No
            </button>
            <button
              aria-pressed={markedDone}
              className={markedDone ? `${styles.doneOption} ${styles.doneOptionDone}` : styles.doneOption}
              onClick={() => setMarkedDone(true)}
              type="button"
            >
              Yes
            </button>
          </div>
        </div>

        <div className={styles.checkInActions}>
          <Button
            variant="danger"
            icon={<TrashIcon size={14} aria-hidden="true" />}
            onClick={discardSession}
          >
            Delete session
          </Button>
          <Button variant="primary" onClick={finishCheckIn}>
            {hasFeedback ? 'Add feedback' : 'Done'}
          </Button>
        </div>
      </section>
    </div>
  );
}
