import { useEffect, useRef, useState } from 'react';

import { useDraggable } from '@dnd-kit/core';
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CoffeeIcon,
  FlagIcon,
  RepeatIcon,
  SquaresFourIcon,
  TargetIcon,
  TrashIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import { Badge, Button, Popover, TextInput, Typography } from '@stride/ui';

import type { RecurrenceRule, ScheduleAction, ScheduleBlock, ScheduleMode } from './schedule.mock';
import { trayActions } from './schedule.mock';
import styles from './ScheduleShared.module.css';

export type SelectedScheduleBlock = ScheduleBlock & { layer: ScheduleMode };

type HeaderProps = {
  title: string;
  mode: ScheduleMode;
  onModeChange: (mode: ScheduleMode) => void;
  dateNavigator?: ScheduleDateNavigatorProps;
  children?: React.ReactNode;
};

type ScheduleDateNavigatorProps = {
  label: string;
  previousLabel: string;
  nextLabel: string;
  selectedDate?: string;
  selectionMode?: 'day' | 'week';
  onPrevious?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  onSelectDate?: (date: string) => void;
};

type ScheduleTrayProps = {
  mode?: ScheduleMode;
  selectedBlock?: SelectedScheduleBlock | null;
  showAdjustInSchedule?: boolean;
  onRenameBlock?: (blockId: string, title: string) => void;
  onLinkAction?: (blockId: string, action: ScheduleAction | null) => void;
  onChangeRecurrence?: (blockId: string, recurrence: RecurrenceRule | null) => void;
  onAdjustInSchedule?: (block: SelectedScheduleBlock) => void;
  onDeleteBlock?: (blockId: string) => void;
  onClearSelection?: () => void;
};

type ScheduleBlockCardProps = {
  block: ScheduleBlock;
  layer: ScheduleMode;
  selected?: boolean;
  compact?: boolean;
  showDuration?: boolean;
  onSelect?: (block: SelectedScheduleBlock) => void;
  onRename?: (blockId: string, title: string) => void;
  draggable?: boolean;
  autoFocusTitle?: boolean;
  allowTiny?: boolean;
  timeFormat?: 'range' | 'start' | 'durationAware';
};

export function ScheduleHeader({ title, mode, onModeChange, dateNavigator, children }: HeaderProps) {
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
        {...dateNavigator}
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
  selectedDate,
  selectionMode = 'day',
  onPrevious,
  onNext,
  onToday,
  onSelectDate,
}: ScheduleDateNavigatorProps) {
  const datePicker = selectedDate && onSelectDate ? (
    <Popover
      align="center"
      popupClassName={styles.datePickerPopup}
      triggerClassName={styles.datePickerTrigger}
      trigger={(
        <>
          <CalendarBlankIcon size={15} />
          {label}
        </>
      )}
    >
      <ScheduleDatePicker
        selectedDate={selectedDate}
        selectionMode={selectionMode}
        onSelectDate={onSelectDate}
      />
    </Popover>
  ) : (
    <Button size="sm" variant="ghost" icon={<CalendarBlankIcon size={15} />}>
      {label}
    </Button>
  );

  return (
    <div className={styles.navButtons} aria-label="Schedule navigation">
      <Button
        size="sm"
        variant="ghost"
        aria-label={previousLabel}
        icon={<CaretLeftIcon size={15} />}
        onClick={onPrevious}
      />
      {datePicker}
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

function ScheduleDatePicker({
  selectedDate,
  selectionMode,
  onSelectDate,
}: {
  selectedDate: string;
  selectionMode: 'day' | 'week';
  onSelectDate: (date: string) => void;
}) {
  const selected = parseDateKey(selectedDate);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selected));
  const [pickerMode, setPickerMode] = useState<'days' | 'months' | 'years'>('days');
  const [yearRangeStart, setYearRangeStart] = useState(() => selected.getFullYear() - 5);
  const monthDays = getCalendarMonthDays(visibleMonth);
  const monthWeeks = chunkDaysByWeek(monthDays);
  const today = new Date();
  const todayKey = toDateKey(today);
  const selectedYear = visibleMonth.getFullYear();
  const isCurrentMonthVisible = today.getFullYear() === visibleMonth.getFullYear()
    && today.getMonth() === visibleMonth.getMonth();
  const years = Array.from({ length: 12 }, (_, index) => yearRangeStart + index);

  function handleMonthChange(monthOffset: number) {
    if (pickerMode === 'years') {
      setYearRangeStart(start => start + monthOffset * 12);
      return;
    }

    setVisibleMonth(month => new Date(month.getFullYear(), month.getMonth() + monthOffset, 1));
  }

  function handleYearChange(year: number) {
    setVisibleMonth(month => new Date(year, month.getMonth(), 1));
    setPickerMode('days');
  }

  function handleMonthChangeByIndex(monthIndex: number) {
    setVisibleMonth(month => new Date(month.getFullYear(), monthIndex, 1));
    setPickerMode('days');
  }

  function handleDateSelect(day: Date) {
    setVisibleMonth(startOfMonth(day));
    onSelectDate(toDateKey(day));
  }

  function handleTodaySelect() {
    setVisibleMonth(startOfMonth(today));
    setYearRangeStart(today.getFullYear() - 5);
    setPickerMode('days');
    onSelectDate(toDateKey(today));
  }

  function handleMonthPickerToggle() {
    setPickerMode(mode => mode === 'months' ? 'days' : 'months');
  }

  function handleYearPickerToggle() {
    setYearRangeStart(selectedYear - 5);
    setPickerMode(mode => mode === 'years' ? 'days' : 'years');
  }

  return (
    <div className={styles.datePicker}>
      <div className={styles.datePickerHeader}>
        {pickerMode === 'months' ? <span /> : (
          <Button
            size="sm"
            variant="ghost"
            aria-label={pickerMode === 'years' ? 'Previous years' : 'Previous month'}
            icon={<CaretLeftIcon size={15} />}
            onClick={() => handleMonthChange(-1)}
          />
        )}
        <div className={styles.datePickerTitle}>
          {pickerMode !== 'years' ? (
            <button
              className={styles.periodTrigger}
              type="button"
              aria-expanded={pickerMode === 'months'}
              onClick={handleMonthPickerToggle}
            >
              {visibleMonth.toLocaleDateString('en-US', { month: 'long' })}
            </button>
          ) : null}
          {pickerMode !== 'months' ? (
            <button
              className={styles.periodTrigger}
              type="button"
              aria-expanded={pickerMode === 'years'}
              onClick={handleYearPickerToggle}
            >
              {selectedYear}
            </button>
          ) : null}
        </div>
        {pickerMode === 'months' ? <span /> : (
          <Button
            size="sm"
            variant="ghost"
            aria-label={pickerMode === 'years' ? 'Next years' : 'Next month'}
            icon={<CaretRightIcon size={15} />}
            onClick={() => handleMonthChange(1)}
          />
        )}
      </div>
      {pickerMode === 'years' ? (
        <>
          <div className={styles.periodRangeLabel}>
            <Typography size="xs" color="muted" weight="semibold">
              {yearRangeStart}–{yearRangeStart + 11}
            </Typography>
          </div>
          <div className={styles.periodGrid}>
            {years.map(year => (
              <button
                key={year}
                className={year === selectedYear ? styles.periodCellActive : styles.periodCell}
                type="button"
                aria-pressed={year === selectedYear}
                onClick={() => handleYearChange(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </>
      ) : pickerMode === 'months' ? (
        <div className={styles.periodGrid}>
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const month = new Date(selectedYear, monthIndex, 1);
            const isActive = monthIndex === visibleMonth.getMonth();

            return (
              <button
                key={monthIndex}
                className={isActive ? styles.periodCellActive : styles.periodCell}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleMonthChangeByIndex(monthIndex)}
              >
                {month.toLocaleDateString('en-US', { month: 'short' })}
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className={styles.weekdayGrid} aria-hidden="true">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <Typography key={day} size="xs" color="muted" weight="semibold">
                {day}
              </Typography>
            ))}
          </div>
          <div className={styles.dateGrid}>
            {monthWeeks.map(week => {
              const weekStartKey = toDateKey(week[0] ?? visibleMonth);
              const isSelectedWeek = selectionMode === 'week'
                && week.some(day => toDateKey(day) === selectedDate);

              return (
                <div
                  key={weekStartKey}
                  className={[
                    selectionMode === 'week' ? styles.dateWeekRowSelectable : styles.dateWeekRow,
                    isSelectedWeek ? styles.dateWeekRowSelected : null,
                  ].filter(Boolean).join(' ')}
                >
                  {week.map(day => {
                    const dateKey = toDateKey(day);
                    const isSelected = selectionMode === 'day' && dateKey === selectedDate;
                    const isToday = dateKey === todayKey;
                    const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();

                    return (
                      <button
                        key={dateKey}
                        className={[
                          styles.dateCell,
                          isSelected ? styles.dateCellSelected : null,
                          isToday ? styles.dateCellToday : null,
                          !isCurrentMonth ? styles.dateCellOutside : null,
                        ].filter(Boolean).join(' ')}
                        type="button"
                        aria-pressed={selectionMode === 'week' ? isSelectedWeek : isSelected}
                        aria-current={isToday ? 'date' : undefined}
                        aria-label={day.toLocaleDateString('en-US', { dateStyle: 'full' })}
                        onClick={() => handleDateSelect(day)}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}
      {!isCurrentMonthVisible ? (
        <div className={styles.datePickerFooter}>
          <Button size="sm" variant="secondary" onClick={handleTodaySelect}>
            Go back to today
          </Button>
        </div>
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
  mode = 'plan',
  selectedBlock,
  showAdjustInSchedule = true,
  onRenameBlock,
  onLinkAction,
  onChangeRecurrence,
  onAdjustInSchedule,
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
                <Detail
                  label={selectedBlock.type === 'session' ? 'Session time' : 'Scheduled'}
                  value={formatBlockTime(selectedBlock)}
                />
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
                {selectedBlock.type !== 'session' && !selectedBlock.fixed ? (
                  <RecurrenceEditor
                    recurrence={selectedBlock.recurrence}
                    onChange={recurrence => onChangeRecurrence?.(selectedBlock.id, recurrence)}
                  />
                ) : null}
              </div>
            </div>
          </div>
          <div className={styles.inspectorActions}>
            {showAdjustInSchedule ? (
              <Button
                size="sm"
                variant="primary"
                icon={<CalendarBlankIcon size={15} />}
                onClick={() => onAdjustInSchedule?.(selectedBlock)}
              >
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

  const isSessionMode = mode === 'actual';
  const filterLabels: Record<typeof workFilter, string> = isSessionMode
    ? {
        neverStarted: 'Not logged',
        inProgress: 'Partially logged',
        highestPriority: 'Priority',
      }
    : {
        neverStarted: 'Never started',
        inProgress: 'In progress',
        highestPriority: 'Highest priority',
      };

  return (
    <ScheduleSideTray
      title={isSessionMode ? 'Log sessions' : 'Plan work'}
      description={isSessionMode
        ? 'Drag actions onto the calendar to backfill sessions, or add an unlinked session.'
        : 'Drag items onto a day.'}
    >
      <div className={styles.trayControls}>
        <div className={styles.searchSortRow}>
          <TextInput
            aria-label={isSessionMode ? 'Search actions to log' : 'Search work to place'}
            placeholder={isSessionMode ? 'Search actions to log' : 'Search work'}
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <select
            className={styles.sortSelect}
            aria-label={isSessionMode ? 'Sort actions' : 'Sort work'}
            value={sortBy}
            onChange={event => setSortBy(event.target.value as typeof sortBy)}
          >
            <option value="recent">Recently created</option>
            <option value="modified">Last modified</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        <div className={styles.filterChips} aria-label={isSessionMode ? 'Filter actions to log' : 'Filter work'}>
          {(['neverStarted', 'inProgress', 'highestPriority'] as const).map(filter => (
            <button
              key={filter}
              className={workFilter === filter ? styles.filterChipActive : styles.filterChip}
              type="button"
              onClick={() => setWorkFilter(filter)}
            >
              {filterLabels[filter]}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.trayList}>
        <Typography size="xs" weight="semibold" color="muted">
          {isSessionMode ? 'Actions to log' : 'Work'}
        </Typography>
        {filteredActions.map(action => (
          <TrayAction key={action.id} action={action} />
        ))}
      </div>
    </ScheduleSideTray>
  );
}

function RecurrenceEditor({
  recurrence,
  onChange,
}: {
  recurrence?: RecurrenceRule;
  onChange: (recurrence: RecurrenceRule | null) => void;
}) {
  const rule = recurrence ?? { frequency: 'weekly', interval: 1, ends: 'never' as const };

  return (
    <div className={recurrence ? styles.recurrenceEditorOpen : styles.recurrenceEditor}>
      <label className={styles.recurrenceHeader}>
        <input
          type="checkbox"
          checked={Boolean(recurrence)}
          onChange={event => onChange(event.target.checked ? rule : null)}
        />
        <span>
          <Typography size="sm" weight="semibold">Repeats</Typography>
          {recurrence ? (
            <Typography size="xs" color="muted">{formatRecurrence(rule)}</Typography>
          ) : null}
        </span>
      </label>
      {recurrence ? (
        <div className={styles.recurrenceFields}>
          <label>
            <span>Every</span>
            <input
              type="number"
              min={1}
              value={rule.interval}
              onChange={event => onChange({ ...rule, interval: Number(event.target.value) || 1 })}
            />
          </label>
          <label>
            <span>Frequency</span>
            <select
              value={rule.frequency}
              onChange={event => onChange({
                ...rule,
                frequency: event.target.value as RecurrenceRule['frequency'],
              })}
            >
              <option value="daily">Days</option>
              <option value="weekly">Weeks</option>
              <option value="monthly">Months</option>
            </select>
          </label>
          <label>
            <span>Ends</span>
            <select
              value={rule.ends}
              onChange={event => onChange({
                ...rule,
                ends: event.target.value as RecurrenceRule['ends'],
              })}
            >
              <option value="never">Never</option>
              <option value="onDate">On date</option>
            </select>
          </label>
          {rule.ends === 'onDate' ? (
            <label>
              <span>End date</span>
              <input
                type="date"
                value={rule.endDate ?? ''}
                onChange={event => onChange({ ...rule, endDate: event.target.value })}
              />
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function formatRecurrence(rule: RecurrenceRule) {
  const unit = rule.frequency === 'daily'
    ? 'day'
    : rule.frequency === 'weekly'
      ? 'week'
      : 'month';
  const cadence = rule.interval === 1 ? `Every ${unit}` : `Every ${rule.interval} ${unit}s`;

  return rule.ends === 'onDate' && rule.endDate ? `${cadence} until ${rule.endDate}` : cadence;
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
  showDuration = false,
  onSelect,
  onRename,
  draggable = false,
  autoFocusTitle = false,
  allowTiny = true,
  timeFormat = 'range',
}: ScheduleBlockCardProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const draggableBlock = useDraggable({
    id: `block:${block.id}`,
    data: { type: 'block', block },
    disabled: !draggable,
  });
  useEffect(() => {
    if (!autoFocusTitle) {
      return;
    }

    const focusTitle = () => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    };
    const animationFrame = window.requestAnimationFrame(focusTitle);
    const timeout = window.setTimeout(focusTitle, 0);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeout);
    };
  }, [autoFocusTitle, block.id]);

  const classNames = [
    styles.block,
    styles[getBlockTypeClassName(block.type)],
    block.fixed ? styles.blockFixed : null,
    selected ? styles.blockSelected : null,
    compact ? styles.blockCompact : null,
    compact && allowTiny && block.durationMin <= 30 ? styles.blockTiny : null,
    compact && allowTiny && block.durationMin <= 15 ? styles.blockMicro : null,
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
        <span className={styles.blockIconRibbon} title={`Imported from ${block.source}; drag is disabled`}>
          {block.recurring ? <RepeatIcon size={12} /> : null}
          <CalendarBlankIcon size={12} />
        </span>
      ) : getBlockTypeIcon(block.type) ? (
        <span className={styles.blockIconRibbon} title={formatEventType(block.type)}>
          {block.sourceKey ? null : block.recurring ? <RepeatIcon size={12} /> : null}
          {getBlockTypeIcon(block.type)}
        </span>
      ) : null}
      {selected && !block.fixed ? (
        <span className={styles.blockTitleEditor} title={block.title}>
          <span className={styles.blockTitleSizer}>{block.title || formatEventType(block.type)}</span>
          <input
            ref={titleInputRef}
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
        <span className={styles.blockTimeRow}>
          <span>{formatBlockTimeLabel(block, timeFormat)}</span>
          {showDuration && block.durationMin >= 45 ? (
            <span className={styles.blockDuration}> · {formatDuration(block.durationMin)}</span>
          ) : null}
        </span>
        <span className={styles.blockMarks}>
          {block.sourceKey ? (
            <span className={styles.sourceKey}>
              {block.recurring ? <RepeatIcon size={12} /> : null}
              <span>{block.sourceKey}</span>
            </span>
          ) : null}
          {block.source ? (
            <span className={block.fixed ? styles.externalSourceMark : styles.sourceMark} aria-label={`From ${block.source}`} title={`${block.source}${block.fixed ? ' · read-only' : ''}`}>
              <CalendarBlankIcon size={12} />
            </span>
          ) : null}
          {block.recurring && !block.sourceKey ? (
            <span className={styles.sourceMark} aria-label="Repeating event" title="Repeating event">
              <RepeatIcon size={12} />
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

export function MiniWeekStrip({
  selectedDate,
  viewParam = 'schedule',
}: {
  selectedDate: string;
  viewParam?: 'schedule' | 'sessions';
}) {
  const displayDays = getDisplayWeekDays(selectedDate);

  return (
    <div className={styles.miniWeek}>
      {displayDays.map(day => (
        <a
          key={day.date}
          className={day.date === selectedDate ? styles.miniDayActive : styles.miniDay}
          href={`/schedule?date=${day.date}&view=${viewParam}`}
        >
          <Typography size="sm" color="muted">{day.label}</Typography>
          <Typography size="base" weight="bold">{day.dayNumber}</Typography>
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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getCalendarMonthDays(month: Date) {
  const firstDay = startOfMonth(month);
  const gridStart = addDays(firstDay, -firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function chunkDaysByWeek(days: Date[]) {
  return Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => (
    days.slice(index * 7, index * 7 + 7)
  ));
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
    startMin: 540,
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

function getBlockTypeIcon(type: ScheduleBlock['type']) {
  switch (type) {
    case 'break':
      return <CoffeeIcon size={12} />;
    case 'meeting':
      return <UsersIcon size={12} />;
    case 'focus':
      return <TargetIcon size={12} />;
    default:
      return null;
  }
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
    case 'research':
      return styles.blockFocus ?? '';
    case 'learning':
      return styles.blockBreak ?? '';
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
    research: 'accent',
    learning: 'success',
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
    research: 'Research',
    learning: 'Learning',
  };

  return labels[type];
}

function formatBlockTime(block: ScheduleBlock) {
  return `${formatTime(block.startMin)}–${formatTime(block.startMin + block.durationMin)}`;
}

function formatBlockTimeLabel(
  block: ScheduleBlock,
  timeFormat: 'range' | 'start' | 'durationAware'
) {
  if (timeFormat === 'start' || (timeFormat === 'durationAware' && block.durationMin < 45)) {
    return formatTime(block.startMin);
  }

  return formatBlockTime(block);
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
