import { useEffect, useState } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  PlayIcon,
  SmileyIcon,
  SmileyMehIcon,
  SmileySadIcon,
  TargetIcon,
  TrashIcon,
  TrayIcon,
} from '@phosphor-icons/react';
import { Button, Typography } from '@stride/ui';

import { pickUpNextAction, useSession, useSpecs } from '@providers';
import type { BacklogAction, BacklogSpec, Feeling } from '@providers';
import styles from './SessionToday.module.css';

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
      .map(action => ({ spec, action })));
}

function formatMins(min: number) {
  const hours = Math.floor(min / 60);
  const mins = min % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

type QueueStatus = { label: string; tone: 'progress' | 'over' | 'scheduled' | 'ready' };

// What the user most needs to decide whether to pick this up next: is it
// already underway (and how much is left), planned for today, or untouched.
function actionStatus(action: BacklogAction): QueueStatus {
  const logged = action.loggedMin ?? 0;
  if (logged > 0 && !action.done) {
    const est = action.estimateMin;
    if (est && logged > est) return { label: 'In progress · over', tone: 'over' };
    if (est) return { label: `In progress · ${formatMins(est - logged)} left`, tone: 'progress' };
    return { label: 'In progress', tone: 'progress' };
  }
  if (action.scheduled) return { label: 'Scheduled', tone: 'scheduled' };
  return { label: 'Ready', tone: 'ready' };
}

const STATUS_TONE_CLASS: Record<QueueStatus['tone'], string> = {
  progress: 'statusProgress',
  over: 'statusOver',
  scheduled: 'statusScheduled',
  ready: 'statusReady',
};

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
        <div className={styles.headText}>
          <Typography as="h1" size="2xl" weight="bold">Today</Typography>
          <Typography as="span" size="base" color="muted">{dateText}</Typography>
        </div>
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

  if (!next) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden="true">
          <TrayIcon size={26} weight="regular" />
        </span>
        <div className={styles.emptyCopy}>
          <Typography as="h2" size="lg" weight="bold">Nothing queued right now</Typography>
          <Typography as="p" size="sm" color="muted" className={styles.emptyText}>
            Pull work in from the backlog, or start a focus session to capture time as you go.
          </Typography>
        </div>
        <div className={styles.emptyActions}>
          <Button
            variant="primary"
            icon={<PlayIcon size={16} weight="fill" />}
            onClick={() => startSession({ title: 'Focus session' })}
          >
            Start a focus session
          </Button>
          <Link className={styles.emptyLink} to="/backlog">
            Browse backlog
            <ArrowRightIcon size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className={`${styles.hero} ${styles.heroIdle}`}>
      <div className={styles.heroMain}>
        <span className={styles.heroEyebrow}>Up next</span>
        <div className={styles.heroTitleRow}>
          <Typography as="h2" size="2xl" weight="bold" className={styles.heroTitle}>
            {next.action.title}
          </Typography>
          <Button
            variant="primary"
            icon={<PlayIcon size={16} weight="fill" />}
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
        <Link
          className={styles.specLink}
          to="/backlog/specs/$specId"
          params={{ specId: next.spec.id }}
          search={{ actionId: undefined }}
          aria-label={`Open spec ${next.spec.sourceKey}: ${next.spec.title}`}
        >
          <span className={styles.specKey}>{next.spec.sourceKey}</span>
          <span className={styles.specTitle}>{next.spec.title}</span>
          <ArrowRightIcon size={13} className={styles.specArrow} aria-hidden="true" />
        </Link>
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
        <div className={styles.runningEyebrow}>
          <span className={styles.pulse} aria-hidden="true" />
          <span className={styles.runningEyebrowLabel}>In session</span>
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
              className={styles.specLink}
              to="/backlog/specs/$specId"
              params={{ specId: running.target.specId }}
              search={{ actionId: undefined }}
              aria-label={`Open spec ${sourceKey}`}
            >
              <span className={styles.specKey}>{sourceKey}</span>
              <ArrowRightIcon size={13} className={styles.specArrow} aria-hidden="true" />
            </Link>
          ) : sourceKey ? (
            <span className={styles.specKey}>{sourceKey}</span>
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
  const [markedDone, setMarkedDone] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  if (!running) return null;
  const minutes = Math.max(1, Math.round(elapsedMs / 60000));
  const spec = specs.find(item => item.id === running.target.specId);
  const hasFeedback = feeling !== null || note.trim().length > 0 || markedDone;

  return (
    <section className={`${styles.hero} ${styles.heroCheckin}`}>
      <div className={styles.checkinHead}>
        <Typography as="h2" size="lg" weight="bold">Anything to add?</Typography>
        <Typography as="p" size="sm" color="muted">
          {running.target.title}
        </Typography>
        <span className={styles.sessionDuration}>
          {minutes === 1 ? '1 minute logged' : `${minutes} minutes logged`}
        </span>
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
          placeholder="Add a note if anything changed."
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
        <Button
          variant="danger"
          icon={<TrashIcon size={14} aria-hidden="true" />}
          onClick={discardSession}
        >
          Delete session
        </Button>
        <Button
          variant="primary"
          onClick={() => completeSession({ feeling: feeling ?? 'neutral', note, markedDone })}
        >
          {hasFeedback ? 'Add feedback' : 'Done'}
        </Button>
      </div>
    </section>
  );
}

function LaterToday() {
  const { phase, running, requestEnd, startSession, switchSession } = useSession();
  const { specs } = useSpecs();
  // Don't repeat whatever the hero is already leading with: the top action
  // while idle, or the active action while a session is running / checking in.
  const heroActionId = phase === 'idle'
    ? pickUpNextAction(specs)?.action.id
    : running?.target.actionId;
  const upcoming = getNextActions(specs)
    .filter(({ action }) => action.id !== heroActionId)
    .slice(0, 4);

  if (upcoming.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <Typography as="h2" size="lg" weight="bold">Later today</Typography>
      </div>
      <ul className={styles.laterList}>
        {upcoming.map(({ spec, action }) => {
          const status = actionStatus(action);
          const isRunningThis = running?.target.actionId === action.id;
          const hasActiveSession = phase !== 'idle';
          const sessionTarget = {
            title: action.title,
            sourceKey: spec.sourceKey,
            estimateMin: action.estimateMin,
            specId: spec.id,
            actionId: action.id,
          };
          const buttonLabel = isRunningThis ? 'End' : hasActiveSession ? 'Switch' : 'Start';
          return (
            <li className={styles.laterRow} key={action.id}>
              <div className={styles.laterCopy}>
                <Typography as="span" size="base" weight="semibold" className={styles.truncate}>
                  {action.title}
                </Typography>
                <div className={styles.queueMeta}>
                  <span className={`${styles.priorityChip} ${styles[`priority${spec.priority}`]}`}>
                    {spec.priority}
                  </span>
                  <Link
                    className={styles.queueSpecLink}
                    to="/backlog/specs/$specId"
                    params={{ specId: spec.id }}
                    search={{ actionId: undefined }}
                    aria-label={`Open spec view for ${spec.sourceKey}`}
                  >
                    {spec.sourceKey}
                  </Link>
                  <span className={styles.queueEstimate}>
                    {action.estimateMin ? formatMins(action.estimateMin) : 'No estimate'}
                  </span>
                </div>
              </div>
              <div className={styles.laterRight}>
                <span className={`${styles.queueStatus} ${styles[STATUS_TONE_CLASS[status.tone]]}`}>
                  {status.label}
                </span>
                <button
                  aria-label={`${buttonLabel} session for ${action.title}`}
                  className={`${styles.quickStart} ${hasActiveSession ? styles.quickSwitch : ''}`}
                  onClick={() => {
                    if (isRunningThis) {
                      requestEnd();
                      return;
                    }

                    if (hasActiveSession) {
                      switchSession(sessionTarget);
                      return;
                    }

                    startSession(sessionTarget);
                  }}
                  type="button"
                >
                  {buttonLabel}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
