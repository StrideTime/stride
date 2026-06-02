import { useEffect, useMemo, useRef, useState } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  CaretDownIcon,
  CaretRightIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  DotsThreeIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Badge, Button, Popover, Select, Typography } from '@stride/ui';

import type { BacklogAction, BacklogSpec } from '../backlog/backlog.mock';
import { useSession } from '../session';
import type { CompletedSession, Feeling } from '../session';
import { useSpecs } from './SpecsProvider';
import {
  buildHistory,
  formatDuration,
  getVisibleHistory,
  type HistoryItem,
} from './utils/specHistory';
import styles from './SpecView.module.css';

type SpecViewProps = { specId: string; focusedActionId?: string };
type TabId = 'overview' | 'history';

const FEELING_LABEL: Record<Feeling, string> = {
  frown: 'Tough',
  neutral: 'Okay',
  smile: 'Good',
  target: 'On point',
};

const completedAt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const historyDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});
const historyTime = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

export function SpecView({ specId, focusedActionId }: SpecViewProps) {
  const { getSpec } = useSpecs();
  const spec = getSpec(specId);
  const [tab, setTab] = useState<TabId>('overview');

  if (!spec) {
    return (
      <section className={styles.page}>
        <Link className={styles.backLink} to="/backlog/specs">
          <ArrowLeftIcon size={15} aria-hidden="true" />
          <Typography as="span" size="sm">
            Back to backlog
          </Typography>
        </Link>
        <Typography as="h1" size="xl" weight="bold">
          Spec not found
        </Typography>
        <Typography as="p" size="sm" color="muted">
          The spec <code className={styles.code}>{specId}</code> is not in your
          backlog.
        </Typography>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to="/backlog/specs">
        <ArrowLeftIcon size={15} aria-hidden="true" />
        <Typography as="span" size="sm">
          Back to backlog
        </Typography>
      </Link>

      <Header spec={spec} />
      <SourcePanel spec={spec} />

      <div className={styles.tabs} role="tablist">
        <button
          aria-selected={tab === 'overview'}
          className={
            tab === 'overview'
              ? `${styles.tab} ${styles.tabActive}`
              : styles.tab
          }
          onClick={() => setTab('overview')}
          role="tab"
          type="button"
        >
          Overview
        </button>
        <button
          aria-selected={tab === 'history'}
          className={
            tab === 'history' ? `${styles.tab} ${styles.tabActive}` : styles.tab
          }
          onClick={() => setTab('history')}
          role="tab"
          type="button"
        >
          History
        </button>
      </div>

      {tab === 'overview' ? (
        <OverviewTab spec={spec} focusedActionId={focusedActionId} />
      ) : (
        <HistoryTab spec={spec} />
      )}
    </section>
  );
}

function Header({ spec }: { spec: BacklogSpec }) {
  const { updateSpec } = useSpecs();
  return (
    <header className={styles.header}>
      <div className={styles.titleLine}>
        <textarea
          aria-label="Spec title"
          className={styles.titleInput}
          onChange={(event) =>
            updateSpec(spec.id, { title: event.target.value })
          }
          rows={1}
          value={spec.title}
        />
        <a
          aria-label={`Open ${spec.sourceKey} in ${spec.source}`}
          className={styles.sourceKeyLink}
          href="#"
          onClick={(event) => event.preventDefault()}
        >
          <span>{spec.sourceKey}</span>
          <ArrowSquareOutIcon size={14} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}

function getSpecType(spec: BacklogSpec) {
  if (spec.labels.includes('history')) return 'Audit trail';
  if (spec.labels.includes('spec-view')) return 'Product UI';
  if (spec.labels.includes('blockers')) return 'Coordination';
  if (spec.labels.includes('migration') || spec.labels.includes('queue'))
    return 'Platform';
  if (spec.labels.includes('refinement')) return 'Refinement';
  return spec.source === 'Jira' ? 'Story' : 'Issue';
}

function SourcePanel({ spec }: { spec: BacklogSpec }) {
  const { updateSpec } = useSpecs();
  const [tagText, setTagText] = useState('');
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const initialEstimate = spec.actions.reduce(
    (sum, action) => sum + (action.estimateMin ?? 0),
    0,
  );
  const [estimateText, setEstimateText] = useState(() =>
    (initialEstimate || '').toString(),
  );
  const openActions = spec.actions.filter((action) => !action.done).length;
  const logged = spec.actions.reduce(
    (sum, action) => sum + action.loggedMin,
    0,
  );
  const estimate = Number.parseInt(estimateText, 10);
  const estimateHours =
    Number.isFinite(estimate) && estimate > 0 ? Math.floor(estimate / 60) : '';
  const estimateMinutes =
    Number.isFinite(estimate) && estimate > 0 ? estimate % 60 : '';
  const tagOptions = [
    'history',
    'spec-view',
    'backend',
    'frontend',
    'refinement',
    'blockers',
    'migration',
  ]
    .filter((tag) => !spec.labels.includes(tag))
    .filter((tag) => tag.toLowerCase().includes(tagText.trim().toLowerCase()));

  const updateEstimate = (part: 'hours' | 'minutes', value: string) => {
    const next = Number.parseInt(value.replace(/[^0-9]/g, ''), 10);
    const hours = part === 'hours' ? next : Number(estimateHours) || 0;
    const minutes = part === 'minutes' ? next : Number(estimateMinutes) || 0;
    const total =
      (Number.isFinite(hours) ? hours : 0) * 60 +
      (Number.isFinite(minutes) ? minutes : 0);
    setEstimateText(total > 0 ? total.toString() : '');
  };
  const statusOptions = (
    spec.source === 'Jira'
      ? ['To Do', 'In Progress', 'In Review', 'Done']
      : ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done']
  ).map((status) => ({ value: status, label: status }));
  const assigneeOptions = [
    'You',
    'Nora',
    'Mina',
    'Priya',
    'Owen',
    'Leo',
    'Unassigned',
  ].map((assignee) => ({ value: assignee, label: assignee }));
  return (
    <section className={styles.sourcePanel} aria-label="Source details">
      <div className={styles.propertiesHeader}>
        <Typography as="h2" size="sm" weight="semibold">
          Properties
        </Typography>
      </div>
      <div className={styles.propertiesList}>
        <div className={styles.propertyRow}>
          <Typography as="span" size="xs" color="muted">
            Status
          </Typography>
          <Select
            className={styles.propertySelect}
            label="Status"
            onChange={(value) => updateSpec(spec.id, { sourceStatus: value })}
            options={statusOptions}
            value={spec.sourceStatus}
          />
        </div>
        <div className={styles.propertyRow}>
          <Typography as="span" size="xs" color="muted">
            Priority
          </Typography>
          <Badge
            variant={
              spec.priority === 'P1'
                ? 'danger'
                : spec.priority === 'P2'
                  ? 'warning'
                  : 'neutral'
            }
          >
            {spec.sourcePriority}
          </Badge>
        </div>
        <div className={styles.propertyRow}>
          <Typography as="span" size="xs" color="muted">
            Owner
          </Typography>
          <Select
            className={styles.propertySelect}
            label="Owner"
            onChange={(value) =>
              updateSpec(spec.id, {
                assignee: value === 'Unassigned' ? undefined : value,
              })
            }
            options={assigneeOptions}
            value={spec.assignee ?? 'Unassigned'}
          />
        </div>
        <div className={styles.propertyRow}>
          <Typography as="span" size="xs" color="muted">
            Type
          </Typography>
          <span className={styles.propertyValue}>◈ {getSpecType(spec)}</span>
        </div>
        <div className={styles.propertyRow}>
          <Typography as="span" size="xs" color="muted">
            Team
          </Typography>
          <span className={styles.propertyValue}>{spec.team}</span>
        </div>
        {spec.sprint ? (
          <div className={styles.propertyRow}>
            <Typography as="span" size="xs" color="muted">
              Sprint
            </Typography>
            <span className={styles.propertyValue}>{spec.sprint}</span>
          </div>
        ) : null}
        <div className={styles.propertyRow}>
          <Typography as="span" size="xs" color="muted">
            Actions
          </Typography>
          <span className={styles.propertyValue}>{`${openActions} open`}</span>
        </div>
        <label className={styles.propertyRow}>
          <Typography as="span" size="xs" color="muted">
            Estimate
          </Typography>
          <span className={styles.propertyEstimate}>
            <span className={styles.estimatePart}>
              <input
                aria-label="Estimate hours"
                inputMode="numeric"
                onChange={(event) =>
                  updateEstimate('hours', event.target.value)
                }
                placeholder="0"
                value={estimateHours}
              />
              <em>h</em>
            </span>
            <span className={styles.estimatePart}>
              <input
                aria-label="Estimate minutes"
                inputMode="numeric"
                onChange={(event) =>
                  updateEstimate('minutes', event.target.value)
                }
                placeholder="0"
                value={estimateMinutes}
              />
              <em>m</em>
            </span>
          </span>
        </label>
        <div className={styles.propertyRow}>
          <Typography as="span" size="xs" color="muted">
            Logged
          </Typography>
          <span className={styles.propertyValue}>
            {logged > 0 ? formatDuration(logged) : 'No time logged'}
          </span>
        </div>
        <div className={`${styles.propertyRow} ${styles.propertyRowTags}`}>
          <Typography as="span" size="xs" color="muted">
            Tags
          </Typography>
          <div className={styles.labelRail} aria-label="Labels">
            {spec.labels.map((label, index) => (
              <span
                className={styles.labelChip}
                data-tone={index % 4}
                key={label}
              >
                {label}
                <button
                  aria-label={`Remove ${label} tag`}
                  onClick={() =>
                    updateSpec(spec.id, {
                      labels: spec.labels.filter((item) => item !== label),
                    })
                  }
                  type="button"
                >
                  ×
                </button>
              </span>
            ))}
            <form
              className={styles.tagForm}
              onSubmit={(event) => {
                event.preventDefault();
                const next = tagText.trim();
                if (next === '' || spec.labels.includes(next)) return;
                updateSpec(spec.id, { labels: [...spec.labels, next] });
                setTagText('');
              }}
            >
              <input
                aria-label="Add tag"
                onBlur={() =>
                  window.setTimeout(() => setTagPickerOpen(false), 120)
                }
                onChange={(event) => {
                  setTagText(event.target.value);
                  setTagPickerOpen(true);
                }}
                onFocus={() => setTagPickerOpen(true)}
                placeholder="Add tag"
                value={tagText}
              />
              {tagPickerOpen && tagOptions.length > 0 ? (
                <div className={styles.tagPicker}>
                  {tagOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        updateSpec(spec.id, { labels: [...spec.labels, tag] });
                        setTagText('');
                        setTagPickerOpen(false);
                      }}
                      type="button"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function OverviewTab({
  spec,
  focusedActionId,
}: {
  spec: BacklogSpec;
  focusedActionId?: string;
}) {
  const { updateSpec, addAction } = useSpecs();
  const { history } = useSession();
  const visibleHistory = useMemo(() => getVisibleHistory(history), [history]);
  const [addingTitle, setAddingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(focusedActionId ?? null);
  const [sessionsAction, setSessionsAction] = useState<BacklogAction | null>(
    null,
  );

  useEffect(() => {
    if (focusedActionId) setExpandedId(focusedActionId);
  }, [focusedActionId]);

  const submitAdd = () => {
    const title = addingTitle.trim();
    if (title === '') return;
    const id = addAction(spec.id, { title });
    setAddingTitle('');
    setExpandedId(id);
    addInputRef.current?.focus();
  };

  return (
    <div className={styles.body}>
      <section className={styles.workPanel}>
        <div className={styles.descriptionBlock}>
          <div className={styles.sectionHeader}>
            <Typography as="h2" size="sm" weight="semibold">
              Description
            </Typography>
          </div>
          {editingDescription ? (
            <textarea
              aria-label="Spec description"
              autoFocus
              className={styles.descriptionEdit}
              onBlur={() => setEditingDescription(false)}
              onChange={(event) =>
                updateSpec(spec.id, { description: event.target.value })
              }
              placeholder="Add source context, constraints, and acceptance notes"
              rows={Math.max(4, spec.description.split('\n').length)}
              value={spec.description}
            />
          ) : (
            <button
              aria-label="Edit spec description"
              className={styles.descriptionRead}
              onClick={() => setEditingDescription(true)}
              type="button"
            >
              <Typography as="span" size="sm">
                {spec.description ||
                  'Click to add source context, constraints, and notes'}
              </Typography>
            </button>
          )}
        </div>

        <div className={styles.actionsPanel}>
          <div className={styles.actionsHead}>
            <div>
              <Typography as="h2" size="sm" weight="semibold">
                Actions
              </Typography>
            </div>
            <Typography as="span" size="xs" color="muted">
              {`${spec.actions.filter((action) => !action.done).length} open · `}
              {`${spec.actions.filter((action) => action.done).length} done`}
            </Typography>
          </div>

          {spec.actions.length === 0 ? (
            <div className={styles.actionsEmpty}>
              <Typography as="p" size="sm" weight="semibold">
                No actions yet
              </Typography>
              <Typography as="p" size="sm" color="muted">
                Add the first execution step before starting work on this spec.
              </Typography>
            </div>
          ) : (
            <ul className={styles.actionsList}>
              {spec.actions.map((action) => (
                <ActionRow
                  action={action}
                  confirming={confirmDeleteId === action.id}
                  expanded={expandedId === action.id}
                  key={action.id}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  onRequestDelete={() => setConfirmDeleteId(action.id)}
                  onToggleExpand={() =>
                    setExpandedId(expandedId === action.id ? null : action.id)
                  }
                  onViewSessions={() => setSessionsAction(action)}
                  sessions={visibleHistory.filter(
                    (session) => session.target.actionId === action.id,
                  )}
                  spec={spec}
                  focused={focusedActionId === action.id}
                />
              ))}
            </ul>
          )}

          <form
            className={styles.addRow}
            onSubmit={(event) => {
              event.preventDefault();
              submitAdd();
            }}
          >
            <PlusIcon size={15} aria-hidden="true" />
            <input
              aria-label="New action title"
              className={styles.addInput}
              onChange={(event) => setAddingTitle(event.target.value)}
              placeholder="Add an action"
              ref={addInputRef}
              value={addingTitle}
            />
          </form>
        </div>
        {sessionsAction ? (
          <SessionsModal
            action={sessionsAction}
            onClose={() => setSessionsAction(null)}
            sessions={visibleHistory.filter(
              (session) => session.target.actionId === sessionsAction.id,
            )}
          />
        ) : null}
      </section>
    </div>
  );
}

type ActionRowProps = {
  action: BacklogAction;
  spec: BacklogSpec;
  confirming: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onViewSessions: () => void;
  sessions: CompletedSession[];
  focused: boolean;
};

function ActionRow({
  action,
  spec,
  confirming,
  expanded,
  onToggleExpand,
  onRequestDelete,
  onCancelDelete,
  onViewSessions,
  sessions,
  focused,
}: ActionRowProps) {
  const { updateAction, deleteAction } = useSpecs();
  const { phase, running, startSession } = useSession();
  const rowRef = useRef<HTMLLIElement>(null);
  const isRunningThis =
    phase !== 'idle' && running?.target.actionId === action.id;
  const canStart = phase === 'idle' && !action.done;
  const loggedMin = sessions.reduce(
    (sum, session) => sum + session.elapsedMin,
    0,
  );

  useEffect(() => {
    if (!focused) return;
    rowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focused]);

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
          <Button size="sm" variant="ghost" onClick={onCancelDelete}>
            Cancel
          </Button>
          <Button
            icon={<TrashIcon size={14} aria-hidden="true" />}
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
    <li
      className={
        action.done
          ? `${styles.actionRow} ${styles.actionDone}`
          : styles.actionRow
      }
      data-expanded={expanded}
      data-focused={focused}
      ref={rowRef}
    >
      <button
        aria-label={
          expanded ? 'Collapse action details' : 'Expand action details'
        }
        className={styles.actionMain}
        onClick={onToggleExpand}
        type="button"
      >
        <span className={styles.expandIcon} aria-hidden="true">
          {expanded ? (
            <CaretDownIcon size={16} weight="bold" />
          ) : (
            <CaretRightIcon size={16} weight="bold" />
          )}
        </span>
        <span className={styles.actionCopy}>
          <span className={styles.actionTitleLine}>
            {expanded ? (
              <input
                aria-label="Action title"
                className={styles.inlineTitleInput}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) =>
                  updateAction(spec.id, action.id, {
                    title: event.target.value,
                  })
                }
                value={action.title}
              />
            ) : (
              <Typography as="span" size="sm" weight="semibold">
                {action.title}
              </Typography>
            )}
            <span className={styles.loggedBadge} data-empty={loggedMin === 0}>
              {loggedMin > 0
                ? `${formatDuration(loggedMin)} logged`
                : 'No time logged'}
            </span>
          </span>
        </span>
      </button>

      <div className={styles.actionControls}>
        {action.done ? <Badge variant="success">Completed</Badge> : null}
        {isRunningThis ? <Badge variant="accent">Running</Badge> : null}
        <ActionMenu
          action={action}
          onDelete={onRequestDelete}
          onViewSessions={onViewSessions}
          onStart={handleStart}
          onToggleDone={() =>
            updateAction(spec.id, action.id, { done: !action.done })
          }
          startDisabled={!canStart}
        />
      </div>

      {expanded ? (
        <div className={styles.actionDetails}>
          <ActionExpanded
            action={action}
            onChangeDescription={(description) =>
              updateAction(spec.id, action.id, { description })
            }
          />
        </div>
      ) : null}
    </li>
  );
}

function ActionExpanded({
  action,
  onChangeDescription,
}: {
  action: BacklogAction;
  onChangeDescription: (description: string) => void;
}) {
  return (
    <div className={styles.actionExpandedGrid}>
      <label className={styles.actionDescriptionField}>
        <Typography as="span" size="xs" color="muted">
          Requirements
        </Typography>
        <textarea
          aria-label="Action requirements"
          className={styles.inlineDescriptionEdit}
          onChange={(event) => onChangeDescription(event.target.value)}
          placeholder="Add requirements, constraints, or acceptance notes"
          rows={3}
          value={action.description ?? ''}
        />
      </label>
    </div>
  );
}

function ActionMenu({
  action,
  startDisabled,
  onViewSessions,
  onStart,
  onToggleDone,
  onDelete,
}: {
  action: BacklogAction;
  startDisabled: boolean;
  onViewSessions: () => void;
  onStart: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
}) {
  return (
    <Popover
      align="end"
      popupClassName={styles.menu}
      trigger={
        <span
          aria-label={`Action options for ${action.title}`}
          className={styles.iconButton}
        >
          <DotsThreeIcon size={20} weight="bold" aria-hidden="true" />
        </span>
      }
      triggerClassName={styles.menuTrigger}
    >
      <button onClick={onViewSessions} role="menuitem" type="button">
        <ClockCounterClockwiseIcon size={14} aria-hidden="true" /> View sessions
      </button>
      <button
        disabled={startDisabled}
        onClick={onStart}
        role="menuitem"
        type="button"
      >
        <PlayIcon size={14} aria-hidden="true" /> Start
      </button>
      <button onClick={onToggleDone} role="menuitem" type="button">
        <CheckCircleIcon size={14} aria-hidden="true" />
        {action.done ? 'Mark incomplete' : 'Mark complete'}
      </button>
      <button
        className={styles.menuDanger}
        onClick={onDelete}
        role="menuitem"
        type="button"
      >
        <TrashIcon size={14} aria-hidden="true" /> Delete
      </button>
    </Popover>
  );
}

function SessionsModal({
  action,
  sessions,
  onClose,
}: {
  action: BacklogAction;
  sessions: CompletedSession[];
  onClose: () => void;
}) {
  return (
    <div
      className={styles.sessionsOverlay}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-label={`Sessions for ${action.title}`}
        className={styles.sessionsDialog}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.sessionsDialogHeader}>
          <div>
            <Typography as="h3" size="base" weight="semibold">
              Sessions
            </Typography>
            <Typography as="p" size="sm" color="muted">
              {action.title}
            </Typography>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        {sessions.length > 0 ? (
          <div className={styles.sessionTrack}>
            {sessions.map((session) => (
              <div className={styles.sessionNode} key={session.id}>
                <span className={styles.sessionDot} aria-hidden="true" />
                <div className={styles.sessionCopy}>
                  <Typography as="span" size="sm" weight="semibold">
                    {formatDuration(session.elapsedMin)} focus block
                  </Typography>
                  <Typography as="span" size="xs" color="muted">
                    {completedAt.format(new Date(session.endedAt))}
                    {' · '}
                    {FEELING_LABEL[session.feeling]}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Typography as="p" size="sm" color="muted">
            No sessions logged yet. Start this action to create the first one.
          </Typography>
        )}
      </section>
    </div>
  );
}

function HistoryTab({ spec }: { spec: BacklogSpec }) {
  const { history, running, phase, elapsedMs } = useSession();
  const sessions = useMemo(
    () =>
      getVisibleHistory(history).filter(
        (session) => session.target.specId === spec.id,
      ),
    [history, spec.id],
  );
  const items = useMemo(
    () =>
      buildHistory(
        spec,
        sessions,
        phase === 'running' ? running : null,
        elapsedMs,
      ),
    [spec, sessions, phase, running, elapsedMs],
  );

  return (
    <div className={styles.body}>
      <ol className={styles.historyList}>
        {items.map((item) => (
          <HistoryRow item={item} key={item.id} />
        ))}
      </ol>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  return (
    <li className={styles.historyRow}>
      <div className={styles.historyWhen}>
        <Typography as="span" size="xs" color="muted">
          {historyDate.format(item.at)}
        </Typography>
        <Typography as="span" size="xs" color="muted">
          {historyTime.format(item.at)}
        </Typography>
      </div>
      <span
        className={`${styles.historyDot} ${item.tone ? styles[item.tone] : ''}`}
      />
      <div className={styles.historyCopy} data-tone={item.tone ?? 'default'}>
        <div className={styles.historyActor} aria-hidden="true">
          {item.actor.slice(0, 1).toUpperCase()}
        </div>
        <div className={styles.historyContent}>
          <div className={styles.historyEventLine}>
            <span className={styles.historyEventType}>{item.eyebrow}</span>
            <Typography
              as="span"
              size="sm"
              weight="semibold"
              className={styles.historyTitle}
            >
              {item.summary}
            </Typography>
          </div>
          {item.changes ? (
            <div className={styles.historyChanges}>
              {item.changes.map((change) => (
                <div
                  className={styles.historyChangeRow}
                  key={`${item.id}-${change.label}`}
                >
                  <span>{change.label}</span>
                  {change.from ? <span>{change.from}</span> : null}
                  {change.from ? <span aria-hidden="true">→</span> : null}
                  <strong>{change.to}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

