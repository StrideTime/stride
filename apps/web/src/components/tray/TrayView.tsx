import {
  ArrowSquareOut,
  CalendarBlank,
  CalendarPlus,
  Play,
  Smiley,
  SmileyMeh,
  SmileySad,
  Target,
} from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { Button, Typography } from '@stride/ui';

import { useAppMode } from '../app-mode';
import type { BacklogAction, BacklogSpec } from '../backlog/backlog.mock';
import { plannedBlocks, type ScheduleBlock } from '../schedule/schedule.mock';
import { useSession, type Feeling, type SessionTarget } from '../session';
import { useSpecs } from '../specs/SpecsProvider';
import styles from './TrayView.module.css';

type TrayAction = BacklogAction & {
  spec: BacklogSpec;
  score: number;
};

type ScheduleMoment = {
  current: ScheduleBlock | null;
  next: ScheduleBlock | null;
  progress: number;
};

const PRIORITY_SCORE: Record<BacklogSpec['priority'], number> = {
  P1: 400,
  P2: 300,
  P3: 200,
  P4: 100,
};

const FEELINGS: Array<{
  value: Feeling;
  label: string;
  icon: typeof Smiley;
  toneClass: 'feelingTough' | 'feelingOkay' | 'feelingGood' | 'feelingTarget';
}> = [
  { value: 'frown', label: 'Tough', icon: SmileySad, toneClass: 'feelingTough' },
  { value: 'neutral', label: 'Okay', icon: SmileyMeh, toneClass: 'feelingOkay' },
  { value: 'smile', label: 'Good', icon: Smiley, toneClass: 'feelingGood' },
  { value: 'target', label: 'On point', icon: Target, toneClass: 'feelingTarget' },
];

export function TrayView() {
  const { mode } = useAppMode();

  return (
    <section className={styles.tray} aria-label="Stride tray">
      {mode === 'schedule-first' ? <ScheduleFirstTray /> : <SessionFirstTray />}
    </section>
  );
}

function SessionFirstTray() {
  const session = useSession();
  const actions = useTrayActions();

  if (session.phase === 'running' && session.running) {
    return <LiveSessionTray />;
  }

  if (session.phase === 'checkin' && session.running) {
    return <SessionCheckIn />;
  }

  return <SessionIdleTray actions={actions} />;
}

function SessionIdleTray({ actions }: { actions: TrayAction[] }) {
  const session = useSession();
  const recommended = actions[0];
  const alternatives = actions.slice(1, 5);

  if (!recommended) {
    return (
      <div className={styles.emptyState}>
        <TrayHeader title="Nothing queued" />
        <Typography as="p" size="sm" color="muted">
          Break down a spec into actions and the tray will keep your next move close.
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <TrayHeader title="Ready when you are" />
      <ActionHero action={recommended} onStart={() => session.startSession(toSessionTarget(recommended))} />
      <div className={styles.alternatives}>
        <Typography as="h2" size="xs" weight="semibold" color="muted">
          More to start
        </Typography>
        {alternatives.map(action => (
          <ActionRow
            key={`${action.spec.id}-${action.id}`}
            action={action}
            onStart={() => session.startSession(toSessionTarget(action))}
          />
        ))}
      </div>
    </div>
  );
}

function LiveSessionTray() {
  const session = useSession();
  const { specs } = useSpecs();
  const [previewProgress, setPreviewProgress] = useState<number | null>(null);
  const [inlineEstimate, setInlineEstimate] = useState<number | null>(null);
  if (!session.running) return null;

  const elapsedHours = Math.floor(session.elapsedMs / 3600000);
  const elapsedMin = Math.floor((session.elapsedMs % 3600000) / 60000);
  const elapsedSec = Math.floor((session.elapsedMs % 60000) / 1000);
  const spec = specs.find(item => item.id === session.running?.target.specId);
  const action = spec?.actions.find(item => item.id === session.running?.target.actionId);
  const estimateMin = inlineEstimate ?? action?.estimateMin ?? session.running.target.estimateMin;
  const hasEstimate = typeof estimateMin === 'number' && estimateMin > 0;
  const loggedBeforeMs = (action?.loggedMin ?? 0) * 60000;
  const totalActionMs = loggedBeforeMs + session.elapsedMs;
  const actualProgress = hasEstimate ? totalActionMs / (estimateMin * 60000) : 0;
  const progress = previewProgress ?? actualProgress;
  const cappedProgress = Math.min(progress, 1.25);
  const progressTone = getProgressTone(progress);
  const progressPercent = Math.min(cappedProgress, 1) * 100;
  const displayedActionMin = hasEstimate
    ? Math.floor(estimateMin * progress)
    : Math.floor(totalActionMs / 60000);

  return (
    <div className={styles.liveLayout}>
      <article className={styles.workCard}>
        <div className={styles.workCardCopy}>
          {spec?.sourceKey ?? session.running.target.sourceKey ? (
            <Typography as="span" size="xs" color="muted">
              {spec?.sourceKey ?? session.running.target.sourceKey}
            </Typography>
          ) : null}
          <Typography as="h1" size="lg" weight="bold">{session.running.target.title}</Typography>
          {spec ? <Typography as="p" size="sm" color="muted">{spec.title}</Typography> : null}
        </div>
        {spec ? (
          <Link
            className={styles.detailsButton}
            to="/specs/$specId"
            params={{ specId: spec.id }}
            search={{ actionId: undefined }}
          >
            View spec
          </Link>
        ) : null}
      </article>
      {hasEstimate ? (
        <div className={styles.arcWrap} aria-label="Action progress against estimate">
          <div className={styles.arcDial}>
            <svg className={styles.arcSvg} viewBox="0 0 220 220" aria-hidden="true">
              <path
                className={styles.arcTrack}
                d="M 54 184 A 86 86 0 1 1 166 184"
                pathLength="100"
              />
              {progressPercent > 0.5 ? (
                <path
                  className={`${styles.arcProgress} ${styles[progressTone]}`}
                  d="M 54 184 A 86 86 0 1 1 166 184"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={100 - progressPercent}
                  style={{ stroke: getArcStroke(progress) } as CSSProperties}
                />
              ) : null}
            </svg>
            <div className={styles.arcCore}>
              <Typography as="div" size="2xl" weight="bold" className={styles.sessionClock}>
                {formatSessionTimer(elapsedHours, elapsedMin, elapsedSec)}
              </Typography>
              <Typography as="strong" size="lg" weight="bold" className={styles.arcActionTime}>
                {formatMinutes(displayedActionMin)} / {formatMinutes(estimateMin)}
              </Typography>
            </div>
          </div>
        </div>
      ) : (
        <NoEstimateTimer elapsed={formatSessionTimer(elapsedHours, elapsedMin, elapsedSec)} />
      )}
      <div className={styles.liveMeta}>
        {hasEstimate ? (
          <span>{formatProgressLabel(progress, displayedActionMin - estimateMin)}</span>
        ) : (
          <InlineEstimateForm onSetEstimate={setInlineEstimate} />
        )}
        <span>{formatStartedAt(session.running.startedAt)}</span>
      </div>
      {isDevEnvironment() && hasEstimate ? (
        <label className={styles.progressPreview}>
          <span>Preview arc</span>
          <input
            type="range"
            min="0"
            max="125"
            value={Math.round((previewProgress ?? actualProgress) * 100)}
            onChange={event => setPreviewProgress(Number(event.target.value) / 100)}
          />
        </label>
      ) : null}
      <Button variant="primary" size="md" onClick={session.requestEnd}>
        End session
      </Button>
    </div>
  );
}

function NoEstimateTimer({ elapsed }: { elapsed: string }) {
  return (
    <div className={styles.noEstimateState}>
      <div className={styles.simpleTimer} aria-label="Current session time">
        <Typography as="div" size="2xl" weight="bold" className={styles.simpleTimerClock}>
          {elapsed}
        </Typography>
        <Typography as="span" size="sm" color="muted">
          Session time
        </Typography>
      </div>
    </div>
  );
}

function InlineEstimateForm({ onSetEstimate }: { onSetEstimate: (minutes: number) => void }) {
  const [estimateText, setEstimateText] = useState('');
  const [editing, setEditing] = useState(false);
  const estimate = Number(estimateText);
  const canSubmit = Number.isFinite(estimate) && estimate > 0;

  if (!editing) {
    return (
      <button className={styles.addEstimateButton} type="button" onClick={() => setEditing(true)}>
        Add estimate
      </button>
    );
  }

  return (
    <form
      className={styles.estimateForm}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setEditing(false);
      }}
      onSubmit={event => {
        event.preventDefault();
        if (canSubmit) onSetEstimate(Math.round(estimate));
      }}
    >
      <input
        aria-label="Estimate in minutes"
        autoFocus
        inputMode="numeric"
        min="1"
        onChange={event => setEstimateText(event.target.value)}
        placeholder="min"
        type="number"
        value={estimateText}
      />
      <button disabled={!canSubmit} type="submit">Set</button>
    </form>
  );
}

function SessionCheckIn() {
  const session = useSession();
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [note, setNote] = useState('');
  const [markedDone, setMarkedDone] = useState<boolean | null>(null);

  if (!session.running) return null;

  const minutes = Math.max(1, Math.round(session.elapsedMs / 60000));

  return (
    <form
      className={styles.checkIn}
      onSubmit={event => {
        event.preventDefault();
        session.completeSession({
          feeling: feeling ?? 'neutral',
          note,
          markedDone: markedDone === true,
        });
      }}
    >
      <div className={styles.checkInHead}>
        <TrayHeader title="How did that go?" />
        <Typography as="p" size="sm" color="muted">
          {session.running.target.title} · {minutes}m
        </Typography>
      </div>
      <div className={styles.feelingScale} aria-label="Optional session feeling">
        {FEELINGS.map(item => {
          const Icon = item.icon;
          const selected = feeling === item.value;
          return (
            <button
              key={item.value}
              className={[
                styles.feelingDot,
                styles[item.toneClass],
                selected ? styles.selectedFeeling : null,
              ].filter(Boolean).join(' ')}
              type="button"
              onClick={() => setFeeling(item.value)}
              aria-pressed={selected}
              aria-label={item.label}
            >
              <Icon size={19} weight={selected ? 'fill' : 'regular'} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <textarea
        className={styles.noteField}
        value={note}
        onChange={event => setNote(event.target.value)}
        placeholder="Add a note if anything changed."
        rows={4}
      />
      <ActionRequirements />
      <div className={styles.completionRow}>
        <Typography as="span" size="sm" weight="semibold">
          Finished the action?
        </Typography>
        <div className={styles.doneChoice} aria-label="Action completion">
          <button
            className={markedDone === false
              ? `${styles.doneOption} ${styles.doneOptionActive}`
              : styles.doneOption}
            type="button"
            onClick={() => setMarkedDone(false)}
            aria-pressed={markedDone === false}
          >
            No
          </button>
          <button
            className={markedDone === true
              ? `${styles.doneOption} ${styles.doneOptionDone}`
              : styles.doneOption}
            type="button"
            onClick={() => setMarkedDone(true)}
            aria-pressed={markedDone === true}
          >
            Yes
          </button>
        </div>
      </div>
      <div className={styles.checkInActions}>
        <Button variant="primary" size="md" type="submit">Save session</Button>
      </div>
    </form>
  );
}

function ActionRequirements() {
  const session = useSession();
  const { specs } = useSpecs();
  const spec = specs.find(item => item.id === session.running?.target.specId);
  const action = spec?.actions.find(item => item.id === session.running?.target.actionId);
  const requirements = action?.description ?? spec?.description;

  if (!requirements) return null;

  return (
    <section className={styles.requirementsBox}>
      <Typography as="h2" size="sm" weight="semibold">Requirements</Typography>
      <Typography as="p" size="sm" color="muted">{requirements}</Typography>
    </section>
  );
}

function ScheduleFirstTray() {
  const actions = useTrayActions();
  const autoMoment = useScheduleMoment();
  const [preview, setPreview] = useState<'auto' | 'scheduled' | 'free'>('auto');
  const moment = preview === 'auto' ? autoMoment : getPreviewScheduleMoment(preview);
  const suggestions = actions.slice(0, 3);

  return (
    <div className={styles.scheduleCompass}>
      <div className={styles.scheduleTopBar}>
        <div className={styles.scheduleDateMark} aria-hidden="true">
          <CalendarBlank size={17} weight="bold" />
        </div>
        <div className={styles.scheduleTitleGroup}>
          <Typography as="span" size="xs" weight="semibold" color="muted">
            {formatTrayDate(new Date())}
          </Typography>
          <Typography as="h1" size="lg" weight="bold">Today</Typography>
        </div>
        <Link
          className={styles.scheduleIconLink}
          to="/"
          aria-label="Open the main Stride window"
          title="Open the main Stride window"
        >
          Open app
          <ArrowSquareOut size={15} weight="bold" aria-hidden="true" />
        </Link>
      </div>
      {isDevEnvironment() ? (
        <div className={styles.schedulePreviewControls} aria-label="Schedule tray preview state">
          {(['auto', 'scheduled', 'free'] as const).map(item => (
            <button
              key={item}
              className={preview === item ? styles.schedulePreviewActive : undefined}
              type="button"
              onClick={() => setPreview(item)}
            >
              {item === 'auto' ? 'Auto' : item === 'scheduled' ? 'Scheduled' : 'Free'}
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.timeline}>
        {moment.current ? (
          <div className={`${styles.spine} ${styles.spineFill}`}>
            <NowNode block={moment.current} progress={moment.progress} />
            <NextNode block={moment.next} />
          </div>
        ) : (
          <>
            <div className={styles.spine}>
              <ClearNode next={moment.next} />
              {moment.next ? <NextNode block={moment.next} /> : null}
            </div>
            <TraySuggestions actions={suggestions} />
          </>
        )}
        <Link className={styles.scheduleLink} to="/schedule">Open schedule</Link>
      </div>
    </div>
  );
}

function NowNode({ block, progress }: { block: ScheduleBlock; progress: number }) {
  const style = { '--block-progress': `${Math.round(progress * 100)}%` } as CSSProperties;

  return (
    <article className={`${styles.tlNode} ${styles.tlNodeNow}`}>
      <span className={styles.tlMarkerNow} aria-hidden="true" />
      <div className={styles.nowCard} style={style}>
        <div className={styles.nowHead}>
          <span className={styles.tlEyebrowAccent}>Now</span>
          <span className={styles.nowRemaining}>{formatRemaining(block, progress)} left</span>
        </div>
        <Typography as="h2" size="xl" weight="bold">{block.title}</Typography>
        <Typography as="p" size="sm" color="muted">
          {block.sourceKey ? `${block.sourceKey} · ` : ''}{formatBlockType(block.type)}
        </Typography>
        <div className={styles.nowScale}>
          <span>{formatMinute(block.startMin)}</span>
          <div className={styles.progressTrack} aria-label="Current block progress">
            <span />
          </div>
          <span>{formatMinute(block.startMin + block.durationMin)}</span>
        </div>
      </div>
    </article>
  );
}

function NextNode({ block }: { block: ScheduleBlock | null }) {
  return (
    <article className={styles.tlNode}>
      <span className={styles.tlMarker} aria-hidden="true" />
      <div className={styles.nodeBody}>
        {block ? (
          <>
            <div className={styles.eyebrowRow}>
              <span className={styles.tlEyebrow}>Next</span>
              <span className={styles.eyebrowTime}>{formatMinute(block.startMin)}</span>
            </div>
            <Typography as="h3" size="base" weight="semibold">{block.title}</Typography>
            <Typography as="p" size="xs" color="muted">
              {formatBlockRange(block)} · {formatBlockType(block.type)}
            </Typography>
          </>
        ) : (
          <>
            <span className={styles.tlEyebrow}>Next</span>
            <Typography as="p" size="sm" color="muted">Nothing else on the plan.</Typography>
          </>
        )}
      </div>
    </article>
  );
}

function ClearNode({ next }: { next: ScheduleBlock | null }) {
  return (
    <article className={`${styles.tlNode} ${styles.tlNodeClear}`}>
      <span className={styles.tlMarkerOpen} aria-hidden="true" />
      <div className={styles.nodeBody}>
        {next ? (
          <>
            <span className={styles.tlEyebrow}>Open until</span>
            <Typography as="h2" size="xl" weight="bold">{formatMinute(next.startMin)}</Typography>
            <Typography as="p" size="sm" color="muted">
              {formatUntil(next)} of open time before the next block.
            </Typography>
          </>
        ) : (
          <>
            <span className={styles.tlEyebrow}>Clear</span>
            <Typography as="h2" size="xl" weight="bold">Rest of day</Typography>
            <Typography as="p" size="sm" color="muted">Nothing else on the plan.</Typography>
          </>
        )}
      </div>
    </article>
  );
}

function TraySuggestions({ actions }: { actions: TrayAction[] }) {
  if (!actions.length) return null;

  return (
    <section className={styles.suggestions} aria-label="Ready to schedule">
      <Typography as="h3" size="xs" weight="semibold" color="muted" className={styles.suggestionsTitle}>
        Ready to schedule
      </Typography>
      <div className={styles.suggestionList}>
        {actions.map(action => (
          <Link
            key={`${action.spec.id}-${action.id}`}
            className={styles.suggestionRow}
            to="/schedule"
            aria-label={`Plan ${action.title} into your open time`}
          >
            <span className={styles.suggestionCopy}>
              <Typography as="span" size="sm" weight="semibold" className={styles.suggestionTitle}>
                {action.title}
              </Typography>
              <Typography as="span" size="xs" color="muted">
                {action.spec.sourceKey}{action.estimateMin ? ` · ${action.estimateMin}m` : ''}
              </Typography>
            </span>
            <span className={styles.suggestionPlan} aria-hidden="true">
              <CalendarPlus size={16} weight="bold" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ActionHero({ action, onStart }: { action: TrayAction; onStart: () => void }) {
  return (
    <article className={styles.actionHero}>
      <div className={styles.heroMeta}>
        <span>{action.spec.sourceKey}</span>
        <span>{action.spec.sourcePriority}</span>
        {action.scheduled ? <span>Scheduled</span> : null}
      </div>
      <Typography as="h1" size="xl" weight="bold">{action.title}</Typography>
      <Typography as="p" size="sm" color="muted">{action.spec.title}</Typography>
      <div className={styles.timeLine}>
        <span>{action.estimateMin ? `${action.estimateMin}m estimate` : 'No estimate'}</span>
        <span>{action.loggedMin}m logged</span>
      </div>
      <Button variant="primary" size="md" icon={<Play size={16} weight="bold" />} onClick={onStart}>
        Start session
      </Button>
    </article>
  );
}

function ActionRow({ action, onStart }: { action: TrayAction; onStart: () => void }) {
  return (
    <button className={styles.actionRow} type="button" onClick={onStart}>
      <span>
        <Typography as="span" size="sm" weight="semibold">{action.title}</Typography>
        <Typography as="span" size="xs" color="muted">
          {action.spec.sourceKey} · {action.estimateMin ? `${action.estimateMin}m` : 'No estimate'}
        </Typography>
      </span>
      <Play size={15} weight="bold" aria-hidden="true" />
    </button>
  );
}

function TrayHeader({ title }: { title: string }) {
  return (
    <header className={styles.header}>
      <Typography as="h1" size="lg" weight="bold">{title}</Typography>
    </header>
  );
}

function useTrayActions() {
  const { specs } = useSpecs();

  return useMemo(() => {
    const actions = specs.flatMap(spec => spec.actions
      .filter(action => !action.done)
      .map(action => ({
        ...action,
        spec,
        score: PRIORITY_SCORE[spec.priority] + (action.scheduled ? 80 : 0) +
          (spec.assignee === 'You' ? 30 : 0) + (action.estimateMin ? Math.max(0, 90 - action.estimateMin) : 55),
      })));

    const hasNoEstimateFixture = actions.some(action => action.id === 'a-16');
    const api331 = specs.find(spec => spec.sourceKey === 'API-331');
    if (!hasNoEstimateFixture && api331) {
      actions.push({
        id: 'a-16',
        title: 'Sketch tray no-estimate timer state',
        assignee: 'You',
        description: 'Validate the simple live-session state before an estimate exists.',
        loggedMin: 0,
        plannedMin: 0,
        spec: api331,
        score: PRIORITY_SCORE[api331.priority] + 95,
      });
    }

    return actions.sort((left, right) => right.score - left.score);
  }, [specs]);
}

function getPreviewScheduleMoment(preview: 'scheduled' | 'free'): ScheduleMoment {
  const current = plannedBlocks.find(block => block.id === 'p6') ?? plannedBlocks[0] ?? null;
  const next = plannedBlocks.find(block => block.id === 'p7') ?? plannedBlocks[1] ?? null;

  if (preview === 'free') return { current: null, next, progress: 0 };
  return { current, next, progress: 0.58 };
}

function useScheduleMoment(): ScheduleMoment {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    const date = toDateKey(now);
    const minute = now.getHours() * 60 + now.getMinutes();
    const blocks = plannedBlocks
      .filter(block => block.date === date)
      .sort((left, right) => left.startMin - right.startMin);
    const current = blocks.find(block => (
      minute >= block.startMin && minute < block.startMin + block.durationMin
    )) ?? null;
    const next = blocks.find(block => block.startMin > minute) ?? null;
    const progress = current
      ? Math.min(Math.max((minute - current.startMin) / current.durationMin, 0), 1)
      : 0;

    return { current, next, progress };
  }, [now]);
}

function toSessionTarget(action: TrayAction): SessionTarget {
  return {
    title: action.title,
    sourceKey: action.spec.sourceKey,
    ...(action.estimateMin ? { estimateMin: action.estimateMin } : {}),
    specId: action.spec.id,
    actionId: action.id,
  };
}

function getProgressTone(progress: number) {
  if (progress > 1.08) return 'progressOver';
  if (progress >= 1) return 'progressComplete';
  return 'progressNormal';
}

function getArcStroke(progress: number) {
  if (progress > 1.08) return 'var(--color-overtime)';
  if (progress >= 1) return 'var(--color-success)';
  if (progress < 0.86) return 'var(--color-accent)';
  const successMix = Math.round(((progress - 0.86) / 0.14) * 100);
  return `color-mix(in oklch, var(--color-success) ${successMix}%, var(--color-accent))`;
}

function formatProgressLabel(progress: number, overByMin: number) {
  if (progress > 1) return `${formatMinutes(Math.max(1, overByMin))} over estimate`;
  if (progress >= 1) return 'Estimate reached';
  if (progress >= 0.86) return 'Close to estimate';
  return 'In progress';
}

function isDevEnvironment() {
  return ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false);
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatSessionTimer(hours: number, minutes: number, seconds: number) {
  return [hours, minutes, seconds]
    .map(value => value.toString().padStart(2, '0'))
    .join(':');
}

function formatStartedAt(startedAt: number) {
  return `Started ${new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(startedAt)}`;
}

function formatBlockRange(block: ScheduleBlock) {
  return `${formatMinute(block.startMin)}–${formatMinute(block.startMin + block.durationMin)}`;
}

function formatMinute(minute: number) {
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date);
}

function formatRemaining(block: ScheduleBlock, progress: number) {
  return formatMinutes(Math.max(Math.ceil(block.durationMin * (1 - progress)), 0));
}

function formatUntil(block: ScheduleBlock) {
  const now = new Date();
  const minute = now.getHours() * 60 + now.getMinutes();
  return formatMinutes(Math.max(block.startMin - minute, 0));
}

function formatTrayDate(date: Date) {
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

function formatBlockType(type: ScheduleBlock['type']) {
  const labels: Record<ScheduleBlock['type'], string> = {
    action: 'Action',
    meeting: 'Meeting',
    break: 'Break',
    focus: 'Focus',
    personal: 'Personal',
    buffer: 'Buffer',
    external: 'External',
    research: 'Research',
    learning: 'Learning',
    session: 'Session',
  };
  return labels[type];
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
  ].join('-');
}
