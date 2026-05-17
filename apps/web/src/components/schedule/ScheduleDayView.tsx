import { useEffect, useRef, useState } from 'react';

import { CaretLeftIcon } from '@phosphor-icons/react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Typography } from '@stride/ui';

import {
  formatTime,
  MiniWeekStrip,
  ModeToggle,
  ScheduleBlockCard,
  ScheduleDateNavigator,
  ScheduleTray,
  type SelectedScheduleBlock,
} from './ScheduleShared';
import { actualBlocks, plannedBlocks, type ScheduleMode } from './schedule.mock';
import styles from './ScheduleDayView.module.css';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_HEIGHT = 72;
const DEFAULT_WORKDAY_START_HOUR = 8;

export function ScheduleDayView({ date }: { date: string }) {
  const [mode, setMode] = useState<ScheduleMode>('plan');
  const navigate = useNavigate();
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const [selectedBlock, setSelectedBlock] = useState<SelectedScheduleBlock | null>(null);
  const [plannedScheduleBlocks, setPlannedScheduleBlocks] = useState(plannedBlocks);
  const activeBlocks = (mode === 'plan' ? plannedScheduleBlocks : actualBlocks)
    .filter(block => block.date === date && block.startMin !== undefined);
  const contextBlocks = (mode === 'plan' ? actualBlocks : plannedScheduleBlocks)
    .filter(block => block.date === date && block.startMin !== undefined);
  const activeBlockLayouts = layoutScheduleBlocks(activeBlocks);

  function handleDayChange(dayOffset: number) {
    navigate({
      to: '/schedule/day/$date',
      params: { date: toDateKey(addDays(parseDateKey(date), dayOffset)) },
    });
  }

  useEffect(() => {
    canvasShellRef.current?.scrollTo({
      top: DEFAULT_WORKDAY_START_HOUR * HOUR_HEIGHT - 12,
      behavior: 'instant',
    });
  }, [date]);

  function handleCanvasDrop(event: React.DragEvent) {
    event.preventDefault();

    const actionId = event.dataTransfer.getData('application/stride-action-id');
    const title = event.dataTransfer.getData('application/stride-action-title');

    if (!actionId || !title || !canvasShellRef.current) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const top = event.clientY - rect.top;
    const startMin = Math.max(0, Math.round((top / HOUR_HEIGHT) * 4) * 15);

    setPlannedScheduleBlocks(blocks => [
      ...blocks,
      {
        id: `planned-${actionId}-${date}-${startMin}`,
        date,
        title,
        type: 'action',
        startMin,
        durationMin: 60,
        actionId,
      },
    ]);
  }

  return (
    <section className={styles.page}>
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <Button
            size="sm"
            variant="secondary"
            aria-label="Back to week"
            icon={<CaretLeftIcon size={15} />}
            onClick={() => navigate({ to: '/schedule' })}
          >
            Back
          </Button>
          <ScheduleDateNavigator
            label={formatDateSelectorLabel(date)}
            previousLabel="Previous day"
            nextLabel="Next day"
            onPrevious={() => handleDayChange(-1)}
            onNext={() => handleDayChange(1)}
          />
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>
        <MiniWeekStrip selectedDate={date} />
        <div className={styles.layout}>
          <div className={styles.canvasShell} ref={canvasShellRef}>
            <div
              className={styles.canvas}
              style={{ '--hour-height': `${HOUR_HEIGHT}px` } as React.CSSProperties}
              onDragOver={event => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={handleCanvasDrop}
            >
              {HOURS.map(hour => (
                <div key={hour} className={isWorkingHour(hour) ? styles.hourRow : styles.hourRowOff}>
                  <Typography size="xs" color="muted">{formatTime(hour * 60)}</Typography>
                </div>
              ))}
              <div className={styles.nowLine} style={{ top: `${14.35 * HOUR_HEIGHT}px` }} />
              {contextBlocks.map(block => (
                <div
                  key={block.id}
                  className={styles.contextBlock}
                  style={blockStyle(block.startMin ?? 0, block.durationMin)}
                >
                  <ScheduleBlockCard block={block} layer={mode === 'plan' ? 'actual' : 'plan'} compact />
                </div>
              ))}
              {activeBlockLayouts.map(({ block, column, columnCount }) => (
                <div
                  key={block.id}
                  className={styles.activeBlock}
                  style={{
                    ...blockStyle(block.startMin ?? 0, block.durationMin),
                    ...columnStyle(column, columnCount),
                  }}
                >
                  <div className={styles.resizeHandle} aria-hidden="true" />
                  <ScheduleBlockCard
                    block={block}
                    layer={mode}
                    selected={selectedBlock?.id === block.id}
                    compact
                    onSelect={blockSelection => setSelectedBlock(blockSelection)}
                  />
                  <div className={styles.resizeHandle} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ScheduleTray
        selectedBlock={selectedBlock}
        onClearSelection={() => setSelectedBlock(null)}
      />
    </section>
  );
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

function formatDateSelectorLabel(date: string) {
  return parseDateKey(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function isWorkingHour(hour: number) {
  return hour >= 8 && hour < 18;
}

function blockStyle(startMin: number, durationMin: number) {
  return {
    top: `${(startMin / 60) * HOUR_HEIGHT}px`,
    height: `${(durationMin / 60) * HOUR_HEIGHT}px`,
  };
}

function columnStyle(column: number, columnCount: number) {
  const gutter = 8;
  const leftBase = 96;
  const rightPad = 16;
  const widthExpression = `calc((100% - ${leftBase + rightPad}px - ${(columnCount - 1) * gutter}px) / ${columnCount})`;

  return {
    left: `calc(${leftBase}px + (${widthExpression} + ${gutter}px) * ${column})`,
    width: widthExpression,
  };
}

function layoutScheduleBlocks(blocks: typeof plannedBlocks) {
  const sortedBlocks = [...blocks].sort((left, right) => (left.startMin ?? 0) - (right.startMin ?? 0));
  const activeColumns: number[] = [];

  return sortedBlocks.map(block => {
    const startMin = block.startMin ?? 0;
    const column = activeColumns.findIndex(endMin => endMin <= startMin);
    const nextColumn = column === -1 ? activeColumns.length : column;

    activeColumns[nextColumn] = startMin + block.durationMin;

    return {
      block,
      column: nextColumn,
      columnCount: Math.max(activeColumns.length, 1),
    };
  });
}
