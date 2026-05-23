import { useEffect, useState } from 'react';

import { Link } from '@tanstack/react-router';
import { ArrowRight, Play, Smiley, SmileyMeh, SmileySad, Target } from '@phosphor-icons/react';
import { Badge, Button, Typography } from '@stride/ui';

import { useSession } from '../session';
import type { Feeling } from '../session';
import { pickUpNextAction, useSpecs } from '../specs';
import { attentionItems, scheduleBlocks, type TodayScheduleBlock } from './today.mock';
import styles from './SessionToday.module.css';

const FEELING_OPTIONS: ReadonlyArray<{ value: Feeling; label: string; icon: typeof Smiley }> = [
  { value: 'frown', label: 'Tough', icon: SmileySad },
  { value: 'neutral', label: 'Okay', icon: SmileyMeh },
  { value: 'smile', label: 'Good', icon: Smiley },
  { value: 'target', label: 'On point', icon: Target },
];

const STARTABLE = new Set<TodayScheduleBlock['state']>(['ready', 'later']);

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
}

function parseMinutes(text: string): number | undefined {
  const match = text.match(/(\d+)\s*m\b/);
  return match ? Number(match[1]) : undefined;
}

function parseSourceKey(text: string): string | undefined {
  const match = text.match(/\b[A-Z]{2,4}-\d+\b/);
  return match ? match[0] : undefined;
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
        <Typography as="span" size="sm" color="muted">{dateText}</Typography>
      </header>

      <Hero />
      <LaterToday />
      <StatusLine />
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
      <Typography as="p" size="xs" weight="semibold" color="muted" className={styles.eyebrow}>
        Up next
      </Typography>

      {next ? (
        <>
          <Typography as="h2" size="xl" weight="bold">{next.action.title}</Typography>
          <div className={styles.heroMeta}>
            <Link
              className={styles.sourceKeyLink}
              to="/specs/$specId"
              params={{ specId: next.spec.id }}
            >
              {next.spec.sourceKey}
            </Link>
            <Typography as="span" size="sm" color="muted">
              {next.action.estimateMin
                ? `${next.action.estimateMin}m estimate · ${next.spec.title}`
                : `No estimate yet · ${next.spec.title}`}
            </Typography>
            <Link
              className={styles.heroSpecLink}
              to="/specs/$specId"
              params={{ specId: next.spec.id }}
            >
              View spec →
            </Link>
          </div>
        </>
      ) : (
        <Typography as="h2" size="xl" weight="bold">Nothing queued right now</Typography>
      )}

      <div className={styles.heroActions}>
        <Button
          variant="primary"
          icon={<Play size={16} weight="fill" />}
          disabled={!next}
          onClick={() => {
            if (next) {
              startSession({
                title: next.action.title,
                sourceKey: next.spec.sourceKey,
                estimateMin: next.action.estimateMin,
                specId: next.spec.id,
                actionId: next.action.id,
              });
            }
          }}
        >
          Start session
        </Button>
        <button
          className={styles.linkButton}
          type="button"
          onClick={() => startSession({ title: 'Focus session' })}
        >
          Start a blank focus session
        </button>
      </div>
    </section>
  );
}

function RunningHero() {
  const { running, elapsedMs, requestEnd } = useSession();
  if (!running) return null;

  const { title, sourceKey, estimateMin } = running.target;
  const ratio = estimateMin ? elapsedMs / 60000 / estimateMin : 0;
  const over = estimateMin != null && ratio >= 1;
  const wayOver = estimateMin != null && ratio >= 1.5;
  const fillClass = wayOver
    ? `${styles.varianceFill} ${styles.varianceWayOver}`
    : over
      ? `${styles.varianceFill} ${styles.varianceOver}`
      : styles.varianceFill;

  return (
    <section className={`${styles.hero} ${styles.heroRunning}`}>
      <div className={styles.runningEyebrow}>
        <span className={styles.pulse} aria-hidden="true" />
        <Typography as="span" size="xs" weight="semibold" color="muted" className={styles.eyebrow}>
          Session running
        </Typography>
      </div>

      <div className={styles.runningTitle}>
        <Typography as="h2" size="lg" weight="bold" className={styles.truncate}>{title}</Typography>
        {running.target.specId && sourceKey ? (
          <Link
            className={styles.sourceKeyLink}
            to="/specs/$specId"
            params={{ specId: running.target.specId }}
          >
            {sourceKey}
          </Link>
        ) : sourceKey ? (
          <span className={styles.sourceKey}>{sourceKey}</span>
        ) : null}
      </div>

      <span className={over ? `${styles.clock} ${styles.clockOver}` : styles.clock}>
        {formatClock(elapsedMs)}
      </span>

      {estimateMin ? (
        <div className={styles.variance}>
          <div
            className={styles.varianceTrack}
            role="progressbar"
            aria-label="Time against estimate"
            aria-valuemin={0}
            aria-valuemax={estimateMin}
            aria-valuenow={Math.round(elapsedMs / 60000)}
          >
            <span className={fillClass} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
          </div>
          <Typography as="span" size="xs" color="muted">
            {wayOver
              ? `Well past the ${estimateMin}m estimate. A good moment to wrap up.`
              : over
                ? `Over the ${estimateMin}m estimate.`
                : `${estimateMin}m estimate`}
          </Typography>
        </div>
      ) : (
        <Typography as="span" size="xs" color="muted">No estimate set for this one.</Typography>
      )}

      <div className={styles.heroActions}>
        <Button variant="primary" onClick={requestEnd}>End session</Button>
      </div>
    </section>
  );
}

function CheckInHero() {
  const { running, elapsedMs, completeSession, resumeSession, discardSession } = useSession();
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [note, setNote] = useState('');
  const [markedDone, setMarkedDone] = useState(false);

  if (!running) return null;
  const minutes = Math.max(1, Math.round(elapsedMs / 60000));

  return (
    <section className={`${styles.hero} ${styles.heroCheckin}`}>
      <div className={styles.checkinHead}>
        <Typography as="h2" size="lg" weight="bold">How did that go?</Typography>
        <Typography as="p" size="sm" color="muted">
          {running.target.title} · {minutes}m tracked
        </Typography>
      </div>

      <div className={styles.feelingRow}>
        {FEELING_OPTIONS.map(option => {
          const Icon = option.icon;
          const active = feeling === option.value;
          return (
            <button
              aria-pressed={active}
              className={active ? `${styles.feeling} ${styles.feelingActive}` : styles.feeling}
              key={option.value}
              onClick={() => setFeeling(option.value)}
              type="button"
            >
              <Icon size={24} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
              <Typography as="span" size="xs" weight="semibold">{option.label}</Typography>
            </button>
          );
        })}
      </div>

      <textarea
        className={styles.note}
        onChange={event => setNote(event.target.value)}
        placeholder="Add a note for yourself (optional)"
        rows={2}
        value={note}
      />

      <label className={styles.doneToggle}>
        <input
          checked={markedDone}
          onChange={event => setMarkedDone(event.target.checked)}
          type="checkbox"
        />
        <Typography as="span" size="sm">{`Mark “${running.target.title}” done`}</Typography>
      </label>

      <div className={styles.checkinActions}>
        <Button variant="ghost" onClick={discardSession}>Discard</Button>
        <div className={styles.checkinActionsRight}>
          <Button variant="secondary" onClick={resumeSession}>Back to timer</Button>
          <Button
            variant="primary"
            disabled={feeling === null}
            onClick={() => {
              if (feeling) completeSession({ feeling, note, markedDone });
            }}
          >
            Save session
          </Button>
        </div>
      </div>
    </section>
  );
}

function LaterToday() {
  const { phase, startSession } = useSession();
  const upcoming = scheduleBlocks.filter(block => block.state !== 'done');

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <Typography as="h2" size="sm" weight="semibold">Later today</Typography>
        <Typography as="span" size="xs" color="muted">{`${upcoming.length} blocks`}</Typography>
      </div>
      <ul className={styles.laterList}>
        {upcoming.map(block => (
          <li className={styles.laterRow} key={block.id}>
            <Typography as="span" size="xs" color="muted" className={styles.laterTime}>
              {block.time}
            </Typography>
            <div className={styles.laterCopy}>
              <Typography as="span" size="sm" weight="semibold" className={styles.truncate}>
                {block.title}
              </Typography>
              <Typography as="span" size="xs" color="muted" className={styles.truncate}>
                {block.detail}
              </Typography>
            </div>
            {STARTABLE.has(block.state) ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={phase !== 'idle'}
                onClick={() => startSession({
                  title: block.title,
                  sourceKey: parseSourceKey(block.detail),
                  estimateMin: parseMinutes(block.detail),
                })}
              >
                Start
              </Button>
            ) : (
              <Badge variant={block.state === 'meeting' ? 'accent' : 'neutral'}>
                {block.state === 'meeting' ? 'Meeting' : 'Break'}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusLine() {
  const count = attentionItems.length;
  return (
    <Link className={styles.statusLine} to="/inbox">
      <Typography as="span" size="sm" color="muted">
        {`${count} ${count === 1 ? 'item needs' : 'items need'} your attention in the inbox`}
      </Typography>
      <ArrowRight size={15} aria-hidden="true" />
    </Link>
  );
}
