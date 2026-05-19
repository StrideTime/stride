import { useState } from 'react';

import { useDraggable } from '@dnd-kit/core';
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  FlagIcon,
  RepeatIcon,
  SquaresFourIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Badge, Button, TextInput, Typography } from '@stride/ui';

import type { ScheduleAction, ScheduleBlock, ScheduleMode } from './schedule.mock';
import { trayActions } from './schedule.mock';
import styles from './ScheduleShared.module.css';

export type SelectedScheduleBlock = ScheduleBlock & { layer: ScheduleMode };

type HeaderProps = {
  title: string;
  mode: ScheduleMode;
  onModeChange: (mode: ScheduleMode) => void;
  children?: React.ReactNode;
};

type ScheduleDateNavigatorProps = {
  label: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious?: () => void;
  onNext?: () => void;
  onToday?: () => void;
};

type ScheduleTrayProps = {
  selectedBlock?: SelectedScheduleBlock | null;
  showAdjustInSchedule?: boolean;
  onRenameBlock?: (blockId: string, title: string) => void;
  onLinkAction?: (blockId: string, action: ScheduleAction | null) => void;
  onDeleteBlock?: (blockId: string) => void;
  onClearSelection?: () => void;
};

type ScheduleBlockCardProps = {
  block: ScheduleBlock;
  layer: ScheduleMode;
  selected?: boolean;
  compact?: boolean;
  onSelect?: (block: SelectedScheduleBlock) => void;
  onRename?: (blockId: string, title: string) => void;
  draggable?: boolean;
};

export function ScheduleHeader({ title, mode, onModeChange, children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <Typography as="h1" size="2xl" weight="bold">
          {title}
        </Typography>
      </div>
      <ScheduleDateNavigator
        label="May 17–23"
        previousLabel="Previous week"
        nextLabel="Next week"
      />
      <div className={styles.headerActions}>
        <ModeToggle mode={mode} onModeChange={onModeChange} />
        {children}
      </div>
    </header>
  );
}

export function ScheduleDateNavigator({
  label,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
  onToday,
}: ScheduleDateNavigatorProps) {
  return (
    <div className={styles.navButtons} aria-label="Schedule navigation">
      <Button
        size="sm"
        variant="ghost"
        aria-label={previousLabel}
        icon={<CaretLeftIcon size={15} />}
        onClick={onPrevious}
      />
      <Button size="sm" variant="ghost" icon={<CalendarBlankIcon size={15} />}>
        {label}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        aria-label={nextLabel}
        icon={<CaretRightIcon size={15} />}
        onClick={onNext}
      />
      {onToday ? (
        <Button size="sm" variant="ghost" onClick={onToday}>
          Today
        </Button>
      ) : null}
    </div>
  );
}

export function ModeToggle({
  mode,
  onModeChange,
}: {
  mode: ScheduleMode;
  onModeChange: (mode: ScheduleMode) => void;
}) {
  return (
    <div className={styles.modeToggle} aria-label="Schedule layer">
      <button
        className={mode === 'plan' ? styles.modeButtonActive : styles.modeButton}
        type="button"
        onClick={() => onModeChange('plan')}
      >
        Schedule
      </button>
      <button
        className={mode === 'actual' ? styles.modeButtonActive : styles.modeButton}
        type="button"
        onClick={() => onModeChange('actual')}
      >
        Sessions
      </button>
    </div>
  );
}

export function ScheduleTray({
  selectedBlock,
  showAdjustInSchedule = true,
  onRenameBlock,
  onLinkAction,
  onDeleteBlock,
  onClearSelection,
}: ScheduleTrayProps) {
  const [query, setQuery] = useState('');
  const [workFilter, setWorkFilter] = useState<'neverStarted' | 'inProgress' | 'highestPriority'>(
    'highestPriority'
  );
  const [sortBy, setSortBy] = useState<'recent' | 'modified' | 'oldest'>('recent');
  const [linkActionQuery, setLinkActionQuery] = useState('');
  const [isLinkActionPickerOpen, setIsLinkActionPickerOpen] = useState(false);
  const filteredActions = trayActions.filter(action => {
    const matchesQuery = `${action.title} ${action.sourceKey}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const remaining = getRemainingMinutes(action);
    const matchesFilter = (workFilter === 'neverStarted' && action.completedMin === 0)
      || (workFilter === 'inProgress' && action.completedMin > 0 && remaining > 0)
      || (workFilter === 'highestPriority' && action.priority === 'Highest');

    return matchesQuery && matchesFilter;
  }).sort((left, right) => {
    if (sortBy === 'modified') {
      return compareDates(right.updatedAt, left.updatedAt);
    }

    if (sortBy === 'oldest') {
      return compareDates(left.createdAt, right.createdAt);
    }

    return compareDates(right.createdAt, left.createdAt);
  });
  const filteredLinkActions = trayActions.filter(action => (
    `${action.title} ${action.specTitle ?? ''} ${action.sourceKey}`
  ).toLowerCase().includes(linkActionQuery.toLowerCase()));

  if (selectedBlock) {
    return (
      <ScheduleSideTray
        title={selectedBlock.title}
        onBack={onClearSelection}
        titleControl={!selectedBlock.fixed ? (
          <label className={styles.sideTrayTitleEditor} title={selectedBlock.title}>
            <span className={styles.sideTrayTitleSizer}>{selectedBlock.title || formatEventType(selectedBlock.type)}</span>
            <input
              className={styles.sideTrayTitleInput}
              aria-label="Scheduled event title"
              title={selectedBlock.title}
              value={selectedBlock.title}
              onChange={event => onRenameBlock?.(selectedBlock.id, event.target.value)}
            />
          </label>
        ) : undefined}
        meta={(
          <Badge variant={getEventTypeBadgeVariant(selectedBlock.type)}>
            {formatEventType(selectedBlock.type)}
          </Badge>
        )}
      >
        <div className={styles.inspector}>
          <div className={styles.detailCard}>
            {selectedBlock.description ? (
              <div className={styles.detailDescription}>
                <Typography size="xs" color="muted">Description</Typography>
                <Typography size="sm">{selectedBlock.description}</Typography>
              </div>
            ) : null}
            <div className={styles.scheduleSection}>
              <div className={styles.detailGrid}>
                <Detail label="Scheduled" value={formatBlockTime(selectedBlock)} />
                {selectedBlock.type === 'action' ? (
                  <>
                    <Detail
                      label="Planned"
                      value={formatDuration(selectedBlock.plannedMin ?? selectedBlock.durationMin)}
                    />
                    <Detail label="Actual" value={formatDuration(selectedBlock.actualMin ?? 0)} />
                  </>
                ) : (
                  <Detail label="Duration" value={formatDuration(selectedBlock.durationMin)} />
                )}
                {selectedBlock.type === 'session' ? (
                  <div className={styles.linkedActionDetail}>
                    <Typography size="xs" color="muted">Linked action</Typography>
                    {selectedBlock.actionId && selectedBlock.sourceKey ? (
                      <div className={styles.linkedActionPill}>
                        <button
                          className={styles.linkedActionPillMain}
                          type="button"
                          onClick={() => setIsLinkActionPickerOpen(true)}
                        >
                          <span>{selectedBlock.title}</span>
                          <span>{selectedBlock.sourceKey}</span>
                        </button>
                        <button
                          className={styles.linkedActionDelete}
                          type="button"
                          aria-label="Remove linked action"
                          onClick={() => {
                            onLinkAction?.(selectedBlock.id, null);
                            setIsLinkActionPickerOpen(false);
                            setLinkActionQuery('');
                          }}
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.linkedActionEmptyButton}
                        type="button"
                        onClick={() => setIsLinkActionPickerOpen(true)}
                      >
                        Link action
                      </button>
                    )}
                    {isLinkActionPickerOpen ? (
                      <div className={styles.linkActionPicker}>
                        <TextInput
                          aria-label="Search actions to link"
                          placeholder="Search action name, spec name, or spec ID"
                          value={linkActionQuery}
                          onChange={event => setLinkActionQuery(event.target.value)}
                        />
                        <div className={styles.linkActionResults}>
                          {filteredLinkActions.map(action => (
                            <button
                              key={action.id}
                              className={styles.linkActionResult}
                              type="button"
                              onClick={() => {
                                onLinkAction?.(selectedBlock.id, action);
                                setIsLinkActionPickerOpen(false);
                                setLinkActionQuery('');
                              }}
                            >
                              <span>{action.title}</span>
                              <span className={styles.linkActionResultMeta}>
                                <span>{action.sourceKey}</span>
                                <FlagIcon
                                  size={13}
                                  weight="fill"
                                  aria-label={`${action.priority} priority`}
                                />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : selectedBlock.actionId && selectedBlock.sourceKey ? (
                  <Detail label="Linked action" value={selectedBlock.sourceKey} />
                ) : null}
                {selectedBlock.source ? <Detail label="Source" value={selectedBlock.source} /> : null}
                {selectedBlock.recurring ? <Detail label="Repeats" value="Yes" /> : null}
              </div>
            </div>
          </div>
          <div className={styles.inspectorActions}>
            {showAdjustInSchedule ? (
              <Button size="sm" variant="primary" icon={<CalendarBlankIcon size={15} />}>
                Adjust in schedule
              </Button>
            ) : null}
            {selectedBlock.actionId && selectedBlock.sourceKey ? (
              <Button size="sm" variant="secondary" icon={<SquaresFourIcon size={15} />}>
                View in spec
              </Button>
            ) : null}
            {!selectedBlock.fixed ? (
              <button
                className={styles.destructiveIconButton}
                type="button"
                aria-label="Delete block"
                onClick={() => onDeleteBlock?.(selectedBlock.id)}
              >
                <TrashIcon size={15} />
              </button>
            ) : null}
          </div>
        </div>
      </ScheduleSideTray>
    );
  }

  return (
    <ScheduleSideTray
      title="Plan work"
      description="Drag items onto a day."
    >
      <div className={styles.trayControls}>
        <div className={styles.searchSortRow}>
          <TextInput
            aria-label="Search work to place"
            placeholder="Search work"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <select
            className={styles.sortSelect}
            aria-label="Sort work"
            value={sortBy}
            onChange={event => setSortBy(event.target.value as typeof sortBy)}
          >
            <option value="recent">Recently created</option>
            <option value="modified">Last modified</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        <div className={styles.filterChips} aria-label="Filter work">
          {([
            ['neverStarted', 'Never started'],
            ['inProgress', 'In progress'],
            ['highestPriority', 'Highest priority'],
          ] as const).map(([filter, label]) => (
            <button
              key={filter}
              className={workFilter === filter ? styles.filterChipActive : styles.filterChip}
              type="button"
              onClick={() => setWorkFilter(filter)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.trayList}>
        <Typography size="xs" weight="semibold" color="muted">
          Work
        </Typography>
        {filteredActions.map(action => (
          <TrayAction key={action.id} action={action} />
        ))}
      </div>
    </ScheduleSideTray>
  );
}

function ScheduleSideTray({
  title,
  description,
  onBack,
  titleControl,
  meta,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onBack?: () => void;
  titleControl?: React.ReactNode;
  meta?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <aside className={styles.sideTray} aria-label={title}>
      <div className={styles.sideTrayHeader}>
        <div className={styles.sideTrayTitleRow}>
          <div className={styles.sideTrayTopLine}>
            {onBack ? (
              <Button size="sm" variant="ghost" icon={<CaretLeftIcon size={15} />} onClick={onBack}>
                Back
              </Button>
            ) : null}
          </div>
          <div className={styles.sideTrayHeading}>
            <div className={styles.sideTrayHeadingRow}>
              {titleControl ?? (
                <Typography as="h2" size="lg" weight="bold">
                  {title}
                </Typography>
              )}
              {meta ? <div className={styles.sideTrayHeadingMeta}>{meta}</div> : null}
            </div>
            {description ? (
              <Typography size="sm" color="muted">
                {description}
              </Typography>
            ) : null}
          </div>
        </div>

      </div>
      <div className={styles.sideTrayBody}>{children}</div>
      {footer ? <div className={styles.sideTrayFooter}>{footer}</div> : null}
    </aside>
  );
}

export function ScheduleBlockCard({
  block,
  layer,
  selected = false,
  compact = false,
  onSelect,
  onRename,
  draggable = false,
}: ScheduleBlockCardProps) {
  const draggableBlock = useDraggable({
    id: `block:${block.id}`,
    data: { type: 'block', block },
    disabled: !draggable,
  });
  const classNames = [
    styles.block,
    styles[getBlockTypeClassName(block.type)],
    block.fixed ? styles.blockFixed : null,
    selected ? styles.blockSelected : null,
    compact ? styles.blockCompact : null,
    compact && block.durationMin <= 30 ? styles.blockTiny : null,
    compact && block.durationMin <= 15 ? styles.blockMicro : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={draggableBlock.setNodeRef}
      className={classNames}
      data-event-type={block.type}
      type="button"
      {...draggableBlock.attributes}
      {...draggableBlock.listeners}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        onSelect?.({ ...block, layer });
      }}
    >
      {block.fixed && block.source ? (
        <span className={styles.externalSourceBadge} title={`Imported from ${block.source}; drag is disabled`}>
          <CalendarBlankIcon size={12} />
          <span>{block.source}</span>
        </span>
      ) : null}
      {selected && !block.fixed ? (
        <span className={styles.blockTitleEditor} title={block.title}>
          <span className={styles.blockTitleSizer}>{block.title || formatEventType(block.type)}</span>
          <input
            className={styles.blockTitleInput}
            aria-label="Scheduled event title"
            title={block.title}
            value={block.title}
            onPointerDownCapture={event => event.stopPropagation()}
            onClick={event => event.stopPropagation()}
            onChange={event => onRename?.(block.id, event.target.value)}
          />
        </span>
      ) : (
        <span className={styles.blockTitle} title={block.title}>{block.title}</span>
      )}
      <span className={styles.blockBottomRow}>
        <span className={block.startMin === undefined ? styles.blockTimeUnscheduled : styles.blockTimeRow}>
          {formatBlockTime(block)}
        </span>
        <span className={styles.blockMarks}>
          {block.sourceKey ? <span className={styles.sourceKey}>{block.sourceKey}</span> : null}
          {block.source ? (
            <span className={styles.sourceMark} aria-label={`From ${block.source}`} title={block.source}>
              <CalendarBlankIcon size={12} />
            </span>
          ) : null}
          {block.recurring ? (
            <span className={styles.sourceMark} aria-label="Repeating event" title="Repeating event">
              <RepeatIcon size={12} />
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

export function MiniWeekStrip({ selectedDate }: { selectedDate: string }) {
  const displayDays = getDisplayWeekDays(selectedDate);

  return (
    <div className={styles.miniWeek}>
      {displayDays.map(day => (
        <a
          key={day.date}
          className={day.date === selectedDate ? styles.miniDayActive : styles.miniDay}
          href={`/schedule/day/${day.date}`}
        >
          <Typography size="xs" color="muted">{day.label}</Typography>
          <Typography size="sm" weight="bold">{day.dayNumber}</Typography>
        </a>
      ))}
    </div>
  );
}

function getDisplayWeekDays(selectedDate: string) {
  const selected = parseDateKey(selectedDate);
  const weekStart = addDays(selected, -selected.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);

    return {
      date: toDateKey(date),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: String(date.getDate()),
    };
  });
}

function parseDateKey(date: string) {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, dayCount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + dayCount);
  return nextDate;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function TrayAction({ action }: { action: ScheduleAction }) {
  const draggableAction = useDraggable({
    id: `action:${action.id}`,
    data: { type: 'action', action },
  });
  const remaining = getRemainingMinutes(action);

  return (
    <article
      ref={draggableAction.setNodeRef}
      className={styles.trayAction}
      {...draggableAction.attributes}
      {...draggableAction.listeners}
    >
      <div className={styles.trayActionMain}>
        <Typography size="sm" weight="semibold">{action.title}</Typography>
        <span className={remaining > 0 ? styles.remainingText : styles.coveredText}>
          {remaining > 0 ? `${remaining}m left` : 'Covered'}
        </span>
        <Typography size="xs" color="muted">
          {action.sourceKey} · {action.priority} · {action.completedMin}m logged · {action.futureScheduledMin}m planned
        </Typography>
      </div>
    </article>
  );
}

export function toScheduleBlock(action: ScheduleAction, date: string): ScheduleBlock {
  return {
    id: `planned-${action.id}-${date}`,
    date,
    title: action.title,
    type: 'action',
    durationMin: 60,
    actionId: action.id,
    sourceKey: action.sourceKey,
  };
}

function compareDates(left?: string, right?: string) {
  return new Date(left ?? 0).getTime() - new Date(right ?? 0).getTime();
}

function getRemainingMinutes(action: ScheduleAction) {
  return Math.max(action.estimateMin - action.completedMin - action.futureScheduledMin, 0);
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailItem}>
      <Typography size="xs" color="muted">{label}</Typography>
      <Typography size="sm" weight="semibold">{value}</Typography>
    </div>
  );
}

function getBlockTypeClassName(type: ScheduleBlock['type']) {
  switch (type) {
    case 'session':
      return styles.blockSession ?? '';
    case 'action':
      return styles.blockAction ?? '';
    case 'meeting':
      return styles.blockMeeting ?? '';
    case 'break':
      return styles.blockBreak ?? '';
    case 'focus':
      return styles.blockFocus ?? '';
    case 'personal':
      return styles.blockPersonal ?? '';
    case 'buffer':
      return styles.blockBuffer ?? '';
    case 'external':
      return styles.blockExternal ?? '';
  }
}

function getEventTypeBadgeVariant(type: ScheduleBlock['type']) {
  const variants: Record<ScheduleBlock['type'], 'neutral' | 'accent' | 'success' | 'warning' | 'danger'> = {
    session: 'accent',
    action: 'accent',
    meeting: 'warning',
    break: 'success',
    focus: 'success',
    personal: 'neutral',
    buffer: 'danger',
    external: 'warning',
  };

  return variants[type];
}

function formatEventType(type: ScheduleBlock['type']) {
  const labels: Record<ScheduleBlock['type'], string> = {
    session: 'Session',
    action: 'Action',
    meeting: 'Meeting',
    break: 'Break',
    focus: 'Focus',
    personal: 'Personal',
    buffer: 'Buffer',
    external: 'External',
  };

  return labels[type];
}

function formatBlockTime(block: ScheduleBlock) {
  if (block.startMin === undefined) {
    return 'Unscheduled';
  }

  return `${formatTime(block.startMin)}–${formatTime(block.startMin + block.durationMin)}`;
}

export function formatTime(totalMin: number) {
  const hour = Math.floor(totalMin / 60);
  const minute = totalMin % 60;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function formatDuration(totalMin: number) {
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
