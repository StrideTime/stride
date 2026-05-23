import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  ArrowSquareOut,
  Plus,
  Smiley,
  SmileyMeh,
  SmileySad,
  Target,
  Trash,
} from '@phosphor-icons/react';
import { Badge, Button, Typography } from '@stride/ui';

import type { BacklogAction, BacklogSpec } from '../backlog/backlog.mock';
import { useSession } from '../session';
import type { Feeling } from '../session';
import { useSpecs } from './SpecsProvider';
import styles from './SpecView.module.css';

type SpecViewProps = { specId: string };

type TabId = 'overview' | 'history';

const FEELING_ICON: Record<Feeling, typeof Smiley> = {
  frown: SmileySad,
  neutral: SmileyMeh,
  smile: Smiley,
  target: Target,
};

const FEELING_LABEL: Record<Feeling, string> = {
  frown: 'Tough',
  neutral: 'Okay',
  smile: 'Good',
  target: 'On point',
};

const PRIORITY_VARIANT: Record<string, 'danger' | 'warning' | 'neutral'> = {
  P1: 'danger',
  P2: 'warning',
  P3: 'neutral',
  P4: 'neutral',
};

const completedAt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function formatDuration(min: number) {
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function parseEstimate(text: string): number | undefined {
  const value = text.trim();
  if (value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
}

export function SpecView({ specId }: SpecViewProps) {
  const { getSpec } = useSpecs();
  const spec = getSpec(specId);
  const [tab, setTab] = useState<TabId>('overview');

  if (!spec) {
    return (
      <section className={styles.page}>
        <Link className={styles.backLink} to="/backlog/specs">
          <ArrowLeft size={15} aria-hidden="true" />
          <Typography as="span" size="sm">Back to backlog</Typography>
        </Link>
        <Typography as="h1" size="xl" weight="bold">Spec not found</Typography>
        <Typography as="p" size="sm" color="muted">
          The spec <code className={styles.code}>{specId}</code> is not in your backlog. It may have been removed.
        </Typography>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to="/backlog/specs">
        <ArrowLeft size={15} aria-hidden="true" />
        <Typography as="span" size="sm">Back to backlog</Typography>
      </Link>

      <Header spec={spec} />
      <MetaStrip spec={spec} />

      <div className={styles.tabs} role="tablist">
        <button
          aria-selected={tab === 'overview'}
          className={tab === 'overview' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setTab('overview')}
          role="tab"
          type="button"
        >
          Overview
        </button>
        <button
          aria-selected={tab === 'history'}
          className={tab === 'history' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setTab('history')}
          role="tab"
          type="button"
        >
          History
        </button>
      </div>

      {tab === 'overview' ? <OverviewTab spec={spec} /> : <HistoryTab spec={spec} />}
    </section>
  );
}

function Header({ spec }: { spec: BacklogSpec }) {
  const { updateSpec } = useSpecs();
  return (
    <header className={styles.header}>
      <div className={styles.sourceLine}>
        <Badge variant="neutral">{spec.source}</Badge>
        <span className={styles.sourceKey}>{spec.sourceKey}</span>
        <a className={styles.sourceLink} href="#" onClick={event => event.preventDefault()}>
          <Typography as="span" size="xs">Open in {spec.source}</Typography>
          <ArrowSquareOut size={13} aria-hidden="true" />
        </a>
      </div>
      <input
        aria-label="Spec title"
        className={styles.titleInput}
        onChange={event => updateSpec(spec.id, { title: event.target.value })}
        value={spec.title}
      />
    </header>
  );
}

function MetaStrip({ spec }: { spec: BacklogSpec }) {
  return (
    <div className={styles.meta}>
      <Meta label="Priority"><Badge variant={PRIORITY_VARIANT[spec.priority]}>{spec.sourcePriority}</Badge></Meta>
      <Meta label="Status"><Badge variant="neutral">{spec.sourceStatus}</Badge></Meta>
      <Meta label="Assignee">
        <Typography as="span" size="sm">{spec.assignee ?? 'Unassigned'}</Typography>
      </Meta>
      {spec.sprint ? (
        <Meta label="Sprint">
          <Typography as="span" size="sm">{spec.sprint}</Typography>
        </Meta>
      ) : null}
      {spec.labels.length > 0 ? (
        <Meta label="Labels">
          <span className={styles.labelChips}>
            {spec.labels.map(label => (
              <Badge key={label} variant="neutral">{label}</Badge>
            ))}
          </span>
        </Meta>
      ) : null}
    </div>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.metaItem}>
      <Typography as="span" size="xs" weight="semibold" color="muted" className={styles.metaLabel}>
        {label}
      </Typography>
      {children}
    </div>
  );
}

function OverviewTab({ spec }: { spec: BacklogSpec }) {
  const { updateSpec, addAction } = useSpecs();
  const [addingTitle, setAddingTitle] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const submitAdd = () => {
    const title = addingTitle.trim();
    if (title === '') return;
    addAction(spec.id, { title });
    setAddingTitle('');
    addInputRef.current?.focus();
  };

  return (
    <div className={styles.body}>
      <section className={styles.descriptionPanel}>
        <Typography as="h2" size="xs" weight="semibold" color="muted" className={styles.sectionLabel}>
          Description
        </Typography>
        <textarea
          aria-label="Spec description"
          className={styles.description}
          onChange={event => updateSpec(spec.id, { description: event.target.value })}
          placeholder="Add a description"
          rows={Math.max(2, spec.description.split('\n').length)}
          value={spec.description}
        />
      </section>

      <section className={styles.actionsPanel}>
        <div className={styles.actionsHead}>
          <Typography as="h2" size="sm" weight="semibold">Actions</Typography>
          <Typography as="span" size="xs" color="muted">
            {`${spec.actions.filter(action => !action.done).length} open · ${spec.actions.filter(action => action.done).length} done`}
          </Typography>
        </div>

        {spec.actions.length === 0 ? (
          <div className={styles.actionsEmpty}>
            <Typography as="p" size="sm" weight="semibold">No actions yet</Typography>
            <Typography as="p" size="sm" color="muted">
              Break this spec into execution steps. Each Action is a focused, sessionable unit of work.
            </Typography>
          </div>
        ) : (
          <ul className={styles.actionsList}>
            {spec.actions.map(action => (
              <ActionRow
                key={action.id}
                action={action}
                spec={spec}
                confirming={confirmDeleteId === action.id}
                onRequestDelete={() => setConfirmDeleteId(action.id)}
                onCancelDelete={() => setConfirmDeleteId(null)}
              />
            ))}
          </ul>
        )}

        <form
          className={styles.addRow}
          onSubmit={event => {
            event.preventDefault();
            submitAdd();
          }}
        >
          <Plus size={15} aria-hidden="true" />
          <input
            aria-label="New action title"
            className={styles.addInput}
            onChange={event => setAddingTitle(event.target.value)}
            placeholder="Add an action"
            ref={addInputRef}
            value={addingTitle}
          />
          <Button
            disabled={addingTitle.trim() === ''}
            size="sm"
            type="submit"
            variant="secondary"
          >
            Add
          </Button>
        </form>
      </section>
    </div>
  );
}

type ActionRowProps = {
  action: BacklogAction;
  spec: BacklogSpec;
  confirming: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
};

function ActionRow({ action, spec, confirming, onRequestDelete, onCancelDelete }: ActionRowProps) {
  const { updateAction, deleteAction } = useSpecs();
  const { phase, running, startSession } = useSession();
  const [estimateText, setEstimateText] = useState(action.estimateMin?.toString() ?? '');

  // Keep local field in sync if the underlying value changes from elsewhere.
  useEffect(() => {
    setEstimateText(action.estimateMin?.toString() ?? '');
  }, [action.estimateMin]);

  const isRunningThis = phase !== 'idle' && running?.target.actionId === action.id;
  const canStart = phase === 'idle' && !action.done;

  const handleStart = () => {
    startSession({
      title: action.title,
      sourceKey: spec.sourceKey,
      estimateMin: action.estimateMin,
      specId: spec.id,
      actionId: action.id,
    });
  };

  if (confirming) {
    return (
      <li className={styles.actionConfirm}>
        <Typography as="span" size="sm">
          {`Delete "${action.title}"? Its logged time is removed with it.`}
        </Typography>
        <div className={styles.confirmActions}>
          <Button size="sm" variant="ghost" onClick={onCancelDelete}>Cancel</Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              deleteAction(spec.id, action.id);
              onCancelDelete();
            }}
          >
            Delete
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className={action.done ? `${styles.actionRow} ${styles.actionDone}` : styles.actionRow}>
      <label className={styles.doneCheck}>
        <input
          aria-label={action.done ? 'Mark as not done' : 'Mark as done'}
          checked={Boolean(action.done)}
          onChange={event => updateAction(spec.id, action.id, { done: event.target.checked })}
          type="checkbox"
        />
      </label>

      <input
        aria-label="Action title"
        className={styles.actionTitle}
        onChange={event => updateAction(spec.id, action.id, { title: event.target.value })}
        value={action.title}
      />

      <div className={styles.actionTime}>
        <span className={styles.estimateField}>
          <input
            aria-label="Estimate in minutes"
            className={styles.estimateInput}
            inputMode="numeric"
            onBlur={() => {
              const parsed = parseEstimate(estimateText);
              updateAction(spec.id, action.id, { estimateMin: parsed });
              setEstimateText(parsed?.toString() ?? '');
            }}
            onChange={event => setEstimateText(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
            }}
            placeholder="–"
            value={estimateText}
          />
          <Typography as="span" size="xs" color="muted">m</Typography>
        </span>
        <Typography as="span" size="xs" color="muted" className={styles.loggedReadout}>
          {action.loggedMin > 0 ? `${formatDuration(action.loggedMin)} logged` : 'No time logged'}
        </Typography>
      </div>

      <div className={styles.actionControls}>
        {isRunningThis ? (
          <Badge variant="accent">Running</Badge>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            disabled={!canStart}
            onClick={handleStart}
          >
            Start
          </Button>
        )}
        <button
          aria-label={`Delete action ${action.title}`}
          className={styles.deleteBtn}
          onClick={onRequestDelete}
          type="button"
        >
          <Trash size={15} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function HistoryTab({ spec }: { spec: BacklogSpec }) {
  const { history } = useSession();
  const sessions = useMemo(
    () => history.filter(session => session.target.specId === spec.id),
    [history, spec.id],
  );

  if (sessions.length === 0) {
    return (
      <div className={styles.body}>
        <div className={styles.historyEmpty}>
          <Typography as="p" size="sm" weight="semibold">No sessions yet</Typography>
          <Typography as="p" size="sm" color="muted">
            Run a session against any Action above and it lands here.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <ul className={styles.historyList}>
        {sessions.map(session => {
          const Icon = FEELING_ICON[session.feeling];
          return (
            <li className={styles.historyRow} key={session.id}>
              <Typography as="span" size="xs" color="muted" className={styles.historyTime}>
                {completedAt.format(new Date(session.endedAt))}
              </Typography>
              <div className={styles.historyCopy}>
                <Typography as="span" size="sm" weight="semibold">{session.target.title}</Typography>
                {session.note ? (
                  <Typography as="span" size="xs" color="muted">{session.note}</Typography>
                ) : null}
              </div>
              <Typography as="span" size="sm" className={styles.historyDuration}>
                {formatDuration(session.elapsedMin)}
              </Typography>
              <span className={styles.feelingTag}>
                <Icon size={14} weight="fill" aria-hidden="true" />
                <Typography as="span" size="xs" weight="semibold">{FEELING_LABEL[session.feeling]}</Typography>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
