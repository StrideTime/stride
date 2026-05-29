import { useEffect, useState } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Play,
  Smiley,
  SmileyMeh,
  SmileySad,
  Target,
} from '@phosphor-icons/react';
import { Button, Typography } from '@stride/ui';

import { useSession } from '../session';
import type { Feeling } from '../session';
import { pickUpNextAction, useSpecs } from '../specs';
import type { BacklogSpec } from '../backlog/backlog.mock';
import styles from './SessionToday.module.css';

const FEELING_OPTIONS: ReadonlyArray<{
  value: Feeling;
  label: string;
  icon: typeof Smiley;
  className: string;
}> = [
  { value: 'frown', label: 'Tough', icon: SmileySad, className: 'feelingTough' },
  { value: 'neutral', label: 'Okay', icon: SmileyMeh, className: 'feelingOkay' },
  { value: 'smile', label: 'Good', icon: Smiley, className: 'feelingGood' },
  { value: 'target', label: 'On point', icon: Target, className: 'feelingOnPoint' },
];

const PRIORITY_ORDER: Record<BacklogSpec['priority'], number> = {
  P1: 0,
  P2: 1,
  P3: 2,
  P4: 3,
};

function getNextActions(specs: BacklogSpec[]) {
  return [...specs]
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .flatMap(spec => spec.actions
      .filter(action => !action.done && (action.assignee === 'You' || (!action.assignee && spec.assignee === 'You')))
      .sort((a, b) => Number(b.scheduled) - Number(a.scheduled))
      .map(action => ({ spec, action })))
    .slice(0, 4);
}

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
}

function dateLabel() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export function SessionToday() {
  const [dateText, setDateText] = useState('');
  useEffect(() => setDateText(dateLabel()), []);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Typography as="h1" size="2xl" weight="bold">Today</Typography>
        <Typography as="span" size="base" color="muted">{dateText}</Typography>
      </header>

      <Hero />
      <LaterToday />
    </section>
  );
}

function Hero() {
  const { phase } = useSession();
  if (phase === 'running') return <RunningHero />;
  if (phase === 'checkin') return <CheckInHero />;
  return <IdleHero />;
}

function IdleHero() {
  const { startSession } = useSession();
  const { specs } = useSpecs();
  const next = pickUpNextAction(specs);

  return (
    <section className={`${styles.hero} ${styles.heroIdle}`}>
      <div className={styles.heroMain}>
        {next ? (
          <>
            <div className={styles.heroTitleRow}>
              <Typography as="h2" size="2xl" weight="bold" className={styles.heroTitle}>
                {next.action.title}
              </Typography>
              <Button
                variant="primary"
                icon={<Play size={16} weight="fill" />}
                onClick={() => {
                  startSession({
                    title: next.action.title,
                    sourceKey: next.spec.sourceKey,
                    specId: next.spec.id,
                    actionId: next.action.id,
                  });
                }}
              >
                Start session
              </Button>
            </div>
            <div className={styles.heroMeta}>
              <Link
                className={styles.ticketLink}
                to="/specs/$specId"
                params={{ specId: next.spec.id }}
                aria-label={`Open spec view for ${next.spec.sourceKey}`}
              >
                <span className={styles.ticketKey}>{next.spec.sourceKey}</span>
                <span className={styles.ticketLinkLabel}>Open spec</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
              <Typography as="span" size="sm" color="muted">
                {next.spec.title}
              </Typography>
            </div>

          </>
        ) : (
          <Typography as="h2" size="2xl" weight="bold">Nothing queued right now</Typography>
        )}

        {next ? null : (
          <div className={styles.heroActions}>
            <button
              className={styles.secondaryAction}
              type="button"
              onClick={() => startSession({ title: 'Focus session' })}
            >
              Start focus session
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function RunningHero() {
  const { running, elapsedMs, requestEnd } = useSession();
  if (!running) return null;

  const { title, sourceKey } = running.target;

  return (
    <section className={`${styles.hero} ${styles.heroRunning}`}>
      <div className={styles.runningContext}>
        <div className={styles.runningEyebrow} aria-label="Session running">
          <span className={styles.pulse} aria-hidden="true" />
        </div>

        <div className={styles.runningTitleBlock}>
          <Typography as="h2" size="xl" weight="bold" className={styles.runningActionTitle}>
            {title}
          </Typography>
        </div>

        <Typography as="span" className={styles.clock}>
          {formatClock(elapsedMs)}
        </Typography>

        <div className={styles.runningActions}>
          <Button variant="primary" onClick={requestEnd}>End session</Button>
          {running.target.specId && sourceKey ? (
            <Link
              className={styles.runningSpecInline}
              to="/specs/$specId"
              params={{ specId: running.target.specId }}
              aria-label={`Open spec view for ${sourceKey}`}
            >
              <span className={styles.runningSpecKey}>{sourceKey}</span>
              <span>Open spec</span>
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          ) : sourceKey ? (
            <span className={styles.sourceKey}>{sourceKey}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CheckInHero() {
  const { running, elapsedMs, completeSession, discardSession } = useSession();
  const { specs } = useSpecs();
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [note, setNote] = useState('');
  const [markedDone, setMarkedDone] = useState<boolean | null>(null);
  const [showRequirements, setShowRequirements] = useState(false);

  if (!running) return null;
  const minutes = Math.max(1, Math.round(elapsedMs / 60000));
  const spec = specs.find(item => item.id === running.target.specId);

  return (
    <section className={`${styles.hero} ${styles.heroCheckin}`}>
      <div className={styles.checkinHead}>
        <Typography as="h2" size="lg" weight="bold">How did that go?</Typography>
        <div className={styles.checkinMeta}>
          <Typography as="p" size="sm" color="muted">
            {running.target.title}
          </Typography>
          <Typography as="span" size="sm" weight="semibold" color="muted">
            {`${minutes}m`}
          </Typography>
        </div>
      </div>

      <div className={styles.feedbackGrid}>
        <div className={styles.feelingRow} aria-label="Optional session feeling">
          {FEELING_OPTIONS.map(option => {
            const Icon = option.icon;
            const active = feeling === option.value;
            return (
              <button
                aria-pressed={active}
                className={active
                  ? `${styles.feeling} ${styles[option.className]} ${styles.feelingActive}`
                  : `${styles.feeling} ${styles[option.className]}`}
                key={option.value}
                onClick={() => setFeeling(option.value)}
                type="button"
              >
                <Icon size={22} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                <Typography as="span" size="sm" weight="semibold">{option.label}</Typography>
              </button>
            );
          })}
        </div>

        <textarea
          className={styles.note}
          onChange={event => setNote(event.target.value)}
          placeholder="What changed?"
          rows={3}
          value={note}
        />
      </div>

      <div className={styles.completionBlock}>
        <div className={styles.completionTopRow}>
          <Typography as="span" size="base" weight="semibold">
            Finished the action?
          </Typography>
          {spec?.description ? (
            <button
              className={styles.requirementsButton}
              onClick={() => setShowRequirements(true)}
              type="button"
            >
              View requirements
            </button>
          ) : null}
        </div>
        <div className={styles.doneChoice} aria-label="Action completion">
          <button
            aria-pressed={markedDone === false}
            className={markedDone === false ? `${styles.doneOption} ${styles.doneOptionActive}` : styles.doneOption}
            onClick={() => setMarkedDone(false)}
            type="button"
          >
            No
          </button>
          <button
            aria-pressed={markedDone === true}
            className={markedDone === true ? `${styles.doneOption} ${styles.doneOptionDone}` : styles.doneOption}
            onClick={() => setMarkedDone(true)}
            type="button"
          >
            Yes
          </button>
        </div>
      </div>

      {showRequirements && spec?.description ? (
        <div className={styles.requirementsOverlay} role="presentation" onClick={() => setShowRequirements(false)}>
          <section
            aria-label="Action requirements"
            className={styles.requirementsDialog}
            onClick={event => event.stopPropagation()}
          >
            <div className={styles.requirementsDialogHead}>
              <Typography as="h3" size="base" weight="bold">Requirements</Typography>
              <button
                className={styles.requirementsClose}
                onClick={() => setShowRequirements(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <Typography as="p" size="sm" color="muted" className={styles.completionDescription}>
              {spec.description}
            </Typography>
          </section>
        </div>
      ) : null}

      <div className={styles.checkinActions}>
        <Button variant="secondary" onClick={discardSession}>Discard</Button>
        <Button
          variant="primary"
          onClick={() => completeSession({ feeling: feeling ?? 'neutral', note, markedDone: markedDone === true })}
        >
          Save session
        </Button>
      </div>
    </section>
  );
}

function LaterToday() {
  const { phase, startSession } = useSession();
  const { specs } = useSpecs();
  const upcoming = getNextActions(specs);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <Typography as="h2" size="lg" weight="bold">Up next</Typography>
      </div>
      <ul className={styles.laterList}>
        {upcoming.map(({ spec, action }) => (
          <li className={styles.laterRow} key={action.id}>
            <div className={styles.laterCopy}>
              <Typography as="span" size="base" weight="semibold" className={styles.truncate}>
                {action.title}
              </Typography>
              <Link
                className={styles.queueSpecLink}
                to="/specs/$specId"
                params={{ specId: spec.id }}
                aria-label={`Open spec view for ${spec.sourceKey}`}
              >
                {spec.sourceKey}
                {action.scheduled ? <span>Scheduled</span> : null}
              </Link>
            </div>
            <div className={styles.laterAction}>
              <button
                aria-label={`Begin ${action.title}`}
                className={styles.quickStart}
                disabled={phase !== 'idle'}
                onClick={() => startSession({
                  title: action.title,
                  sourceKey: spec.sourceKey,
                  specId: spec.id,
                  actionId: action.id,
                })}
                type="button"
              >
                Begin
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
