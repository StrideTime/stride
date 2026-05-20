import { useEffect, useState } from 'react';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useNavigate } from '@tanstack/react-router';
import { Typography } from '@stride/ui';

import { ScheduleBudgetSummary } from './ScheduleBudgetSummary';
import {
  ScheduleBlockCard,
  ScheduleHeader,
  ScheduleTray,
  toScheduleBlock,
  type SelectedScheduleBlock,
} from './ScheduleShared';
import {
  actualBlocks,
  plannedBlocks,
  type ScheduleAction,
  type ScheduleBlock,
  type ScheduleMode,
} from './schedule.mock';
import styles from './ScheduleWeekView.module.css';

type WeekDay = {
  date: string;
  label: string;
  dayNumber: string;
  capacity: string;
};

const TODAY_DATE = '2026-05-20';

type WeekDayColumnProps = {
  day: WeekDay;
  dayBlocks: ScheduleBlock[];
  mode: ScheduleMode;
  selectedBlock: SelectedScheduleBlock | null;
  newBlockTitleFocusId: string | null;
  onNavigate: () => void;
  onSelectBlock: (block: SelectedScheduleBlock) => void;
  onOpenDay: (block?: ScheduleBlock) => void;
};

export function ScheduleWeekView() {
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [mode, setMode] = useState<ScheduleMode>('plan');
  const [activeDrag, setActiveDrag] = useState<ScheduleAction | ScheduleBlock | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<SelectedScheduleBlock | null>(null);
  const [newBlockTitleFocusId, setNewBlockTitleFocusId] = useState<string | null>(null);
  const [focusedDate, setFocusedDate] = useState('2026-05-18');
  const [plannedScheduleBlocks, setPlannedScheduleBlocks] = useState<ScheduleBlock[]>(plannedBlocks);
  const activeBlocks = mode === 'plan' ? plannedScheduleBlocks : actualBlocks;
  const weekDays = getWeekDays(focusedDate);
  const periodStart = weekDays[0]?.date ?? focusedDate;
  const periodEnd = weekDays.at(-1)?.date ?? focusedDate;

  useEffect(() => {
    setSelectedBlock(null);
    setNewBlockTitleFocusId(null);
  }, [mode]);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    setActiveDrag((data?.action ?? data?.block ?? null) as ScheduleAction | ScheduleBlock | null);
  }

  function handleChangeRecurrence(
    blockId: string,
    recurrence: ScheduleBlock['recurrence'] | null
  ) {
    const recurrenceFields = recurrence
      ? { recurring: true, recurrence }
      : { recurring: false, recurrence: undefined };

    setPlannedScheduleBlocks(blocks => blocks.map(block => (
      block.id === blockId ? { ...block, ...recurrenceFields } : block
    )));
    setSelectedBlock(block => (block?.id === blockId ? { ...block, ...recurrenceFields } : block));
  }

  function handleDragEnd(event: DragEndEvent) {
    const date = event.over?.data.current?.date as string | undefined;
    const data = event.active.data.current;
    setActiveDrag(null);

    if (!date || !data) {
      return;
    }

    if (data.type === 'action') {
      const action = data.action as ScheduleAction;

      setPlannedScheduleBlocks(blocks => {
        const newBlock = {
          ...toScheduleBlock(action, date),
          id: `week-${action.id}-${date}-${Date.now()}`,
          startMin: 540 + blocks.filter(block => block.date === date).length * 75,
        };

        setSelectedBlock({ ...newBlock, layer: mode });
        setNewBlockTitleFocusId(newBlock.id);

        return [...blocks, newBlock];
      });
      return;
    }

    if (data.type === 'block') {
      const block = data.block as ScheduleBlock;
      setPlannedScheduleBlocks(blocks => blocks.map(item => {
        if (item.id !== block.id) {
          return item;
        }

        if (item.recurring) {
          window.confirm('This is a recurring scheduled event. Apply this move to future events too?');
        }

        return item.type === 'action'
          ? { ...item, date, startMin: undefined }
          : { ...item, date };
      }));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <section className={styles.page}>
        <div className={styles.mainContent}>
          <ScheduleHeader
            title="Plan the week."
            mode={mode}
            onModeChange={setMode}
            dateNavigator={{
              label: formatWeekRangeLabel(focusedDate),
              previousLabel: 'Previous week',
              nextLabel: 'Next week',
              selectedDate: focusedDate,
              selectionMode: 'week',
              onPrevious: () => setFocusedDate(date => toDateKey(addDays(parseDateKey(date), -7))),
              onNext: () => setFocusedDate(date => toDateKey(addDays(parseDateKey(date), 7))),
              onSelectDate: setFocusedDate,
            }}
          />
          <ScheduleBudgetSummary
            mode={mode}
            plannedBlocks={plannedScheduleBlocks}
            actualBlocks={actualBlocks}
            periodStart={periodStart}
            periodEnd={periodEnd}
          />
          <div className={styles.weekGrid}>
            {weekDays.map(day => {
              const dayBlocks = activeBlocks
                .filter(block => block.date === day.date)
                .sort((left, right) => {
                  if (left.startMin === undefined && right.startMin === undefined) {
                    return 0;
                  }

                  if (left.startMin === undefined) {
                    return 1;
                  }

                  if (right.startMin === undefined) {
                    return -1;
                  }

                  return left.startMin - right.startMin;
                });

              return (
                <WeekDayColumn
                  key={day.date}
                  day={day}
                  dayBlocks={dayBlocks}
                  mode={mode}
                  selectedBlock={selectedBlock}
                  newBlockTitleFocusId={newBlockTitleFocusId}
                  onNavigate={() => navigate({ to: '/schedule/day/$date', params: { date: day.date } })}
                  onSelectBlock={blockSelection => setSelectedBlock(blockSelection)}
                  onOpenDay={block => navigate({
                    to: '/schedule/day/$date',
                    params: { date: day.date },
                    search: block ? { blockId: block.id } : undefined,
                  })}
                />
              );
            })}
          </div>
        </div>
        <ScheduleTray
          mode={mode}
          selectedBlock={selectedBlock}
          onChangeRecurrence={handleChangeRecurrence}
          onAdjustInSchedule={block => navigate({
            to: '/schedule/day/$date',
            params: { date: block.date },
            search: { blockId: block.id },
          })}
          onClearSelection={() => setSelectedBlock(null)}
        />
      </section>
      <DragOverlay zIndex={9999} dropAnimation={null}>
        {activeDrag ? (
          <div className={styles.dragOverlayCard}>
            <ScheduleBlockCard
              block={'estimateMin' in activeDrag
                ? toScheduleBlock(activeDrag, 'preview')
                : activeDrag.type === 'action'
                  ? { ...activeDrag, startMin: undefined }
                  : activeDrag}
              layer={mode}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function WeekDayColumn({
  day,
  dayBlocks,
  mode,
  selectedBlock,
  newBlockTitleFocusId,
  onNavigate,
  onSelectBlock,
  onOpenDay,
}: WeekDayColumnProps) {
  const droppable = useDroppable({ id: `day:${day.date}`, data: { date: day.date } });

  return (
    <div
      ref={droppable.setNodeRef}
      className={[
        styles.dayColumn,
        day.date === TODAY_DATE ? styles.dayColumnToday : null,
        droppable.isOver ? styles.dayColumnDragOver : null,
      ].filter(Boolean).join(' ')}

    >
      <header className={styles.dayHeader}>
        <div className={styles.dayTitle}>
          <Typography size="sm" weight="semibold">{day.label}</Typography>
          <Typography size="sm" color="muted">{day.dayNumber}</Typography>
        </div>
        <button className={styles.openDayButton} type="button" onClick={onNavigate}>
          Daily view ›
        </button>
        <Typography size="xs" color="muted">{day.capacity}</Typography>
      </header>
      <div className={styles.blockList}>
        {dayBlocks.length ? dayBlocks.map(block => (
          <div key={block.id} onDoubleClick={() => onOpenDay(block)}>
            <ScheduleBlockCard
              block={block}
              layer={mode}
              selected={selectedBlock?.id === block.id}
              compact
              allowTiny={false}
              timeFormat="start"
              draggable={mode === 'plan'}
              autoFocusTitle={newBlockTitleFocusId === block.id}
              onSelect={onSelectBlock}
            />
          </div>
        )) : (
          <Typography size="sm" color="muted">No timed blocks</Typography>
        )}
      </div>
    </div>
  );
}

function getWeekDays(focusedDate: string): WeekDay[] {
  const weekStart = getWeekStart(parseDateKey(focusedDate));

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const isWeekend = index === 0 || index === 6;

    return {
      date: toDateKey(date),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: String(date.getDate()),
      capacity: isWeekend ? 'Off hours' : 'Open capacity',
    };
  });
}

function getWeekStart(date: Date) {
  return addDays(date, -date.getDay());
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

function formatWeekRangeLabel(focusedDate: string) {
  const weekStart = getWeekStart(parseDateKey(focusedDate));
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();

  if (sameMonth) {
    return `${weekStart.toLocaleDateString('en-US', { month: 'short' })} ${weekStart.getDate()}–${weekEnd.getDate()}`;
  }

  return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}
