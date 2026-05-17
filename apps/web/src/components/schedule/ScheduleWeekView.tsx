import { useState } from 'react';

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
  weekDays,
} from './schedule.mock';
import styles from './ScheduleWeekView.module.css';

type WeekDay = (typeof weekDays)[number];

const TODAY_DATE = '2026-05-20';

type WeekDayColumnProps = {
  day: WeekDay;
  dayBlocks: ScheduleBlock[];
  mode: ScheduleMode;
  selectedBlock: SelectedScheduleBlock | null;
  onNavigate: () => void;
  onSelectBlock: (block: SelectedScheduleBlock) => void;
  onOpenDay: () => void;
};

export function ScheduleWeekView() {
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [mode, setMode] = useState<ScheduleMode>('plan');
  const [activeDrag, setActiveDrag] = useState<ScheduleAction | ScheduleBlock | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<SelectedScheduleBlock | null>(null);
  const [plannedScheduleBlocks, setPlannedScheduleBlocks] = useState<ScheduleBlock[]>(plannedBlocks);
  const activeBlocks = mode === 'plan' ? plannedScheduleBlocks : actualBlocks;

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    setActiveDrag((data?.action ?? data?.block ?? null) as ScheduleAction | ScheduleBlock | null);
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

      setPlannedScheduleBlocks(blocks => [
        ...blocks,
        {
          ...toScheduleBlock(action, date),
          startMin: 540 + blocks.filter(block => block.date === date).length * 75,
        },
      ]);
      return;
    }

    if (data.type === 'block') {
      const block = data.block as ScheduleBlock;
      setPlannedScheduleBlocks(blocks => blocks.map(item => {
        if (item.id !== block.id) {
          return item;
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
          <ScheduleHeader title="Plan the week." mode={mode} onModeChange={setMode} />
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
                  onNavigate={() => navigate({ to: '/schedule/day/$date', params: { date: day.date } })}
                  onSelectBlock={blockSelection => setSelectedBlock(blockSelection)}
                  onOpenDay={() => navigate({ to: '/schedule/day/$date', params: { date: day.date } })}
                />
              );
            })}
          </div>
        </div>
        <ScheduleTray
          selectedBlock={selectedBlock}
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
          <div key={block.id} onDoubleClick={onOpenDay}>
            <ScheduleBlockCard
              block={block}
              layer={mode}
              selected={selectedBlock?.id === block.id}
              draggable={mode === 'plan'}
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
