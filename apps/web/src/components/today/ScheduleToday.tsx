import { useEffect, useState } from 'react';

import {
  CalendarBlankIcon,
  CaretRightIcon,
  CheckIcon,
  CoffeeIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { Button, Typography } from '@stride/ui';

import { scheduleBlocks, type TodayScheduleBlock } from './today.mock';
import styles from './ScheduleToday.module.css';

const BLOCK_LABEL: Record<TodayScheduleBlock['state'], string> = {
  ready: 'Now',
  later: 'Work',
  meeting: 'Meeting',
  done: 'Done',
  break: 'Break',
};

// The rail node carries block type at a glance: meetings, breaks, and done
// blocks get an icon; focus work stays a quiet dot so the plan reads calmly.
const BLOCK_ICON: Partial<Record<TodayScheduleBlock['state'], typeof CheckIcon>> = {
  meeting: UsersThreeIcon,
  break: CoffeeIcon,
  done: CheckIcon,
};

function parseMinutes(text: string): number {
  const match = text.match(/(\d+)\s*m\b/);
  return match ? Number(match[1]) : 0;
}

function formatDuration(min: number) {
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Add minutes to a "h:mm AM/PM" clock string so the current block can show
// its real time window instead of a plan-only "ready to start" phrasing.
function addMinutes(time: string, minutes: number): string | null {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const [, hourPart, minutePart, periodPart] = match;
  if (!hourPart || !minutePart || !periodPart) return null;
  const base = (Number(hourPart) % 12) + (/pm/i.test(periodPart) ? 12 : 0);
  const total = (((base * 60 + Number(minutePart) + minutes) % 1440) + 1440) % 1440;
  const period = total >= 720 ? 'PM' : 'AM';
  const hour = total % 720 === 0 ? 12 : Math.floor((total % 720) / 60) || 12;
  return `${hour}:${String(total % 60).padStart(2, '0')} ${period}`;
}

function dateLabel() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export function ScheduleToday() {
  const [dateText, setDateText] = useState('');
  useEffect(() => setDateText(dateLabel()), []);

  // TEMP dev-only control to preview the empty-schedule state. Remove before ship.
  const [showEmpty, setShowEmpty] = useState(false);
  const blocks = showEmpty ? [] : scheduleBlocks;
  const hasBlocks = blocks.length > 0;

  const currentIndex = blocks.findIndex(block => block.state === 'ready');
  const currentBlock = blocks[currentIndex >= 0 ? currentIndex : 0];

  const currentMinutes = currentBlock ? parseMinutes(currentBlock.detail) : 0;
  const currentEnd = currentBlock && currentMinutes > 0
    ? addMinutes(currentBlock.time, currentMinutes)
    : null;
  const currentDetail = currentBlock
    ? currentEnd
      ? `${currentBlock.time} – ${currentEnd} · ${formatDuration(currentMinutes)} block`
      : `${currentBlock.time} · ${currentBlock.detail}`
    : '';

  return (
    <section className={styles.page}>
      {/* TEMP dev-only toggle — remove before shipping. */}
      <button
        type="button"
        className={`${styles.devToggle} ${showEmpty ? styles.devToggleActive : ''}`}
        onClick={() => setShowEmpty(value => !value)}
      >
        {`Dev · empty day: ${showEmpty ? 'on' : 'off'}`}
      </button>

      <header className={styles.header}>
        <div className={styles.headText}>
          <Typography as="h1" size="2xl" weight="bold">Today</Typography>
          <Typography as="span" size="base" color="muted">{dateText}</Typography>
        </div>
        {hasBlocks ? (
          <Button
            className={styles.scheduleButton}
            variant="secondary"
            icon={<CaretRightIcon size={15} aria-hidden="true" />}
          >
            View today’s schedule
          </Button>
        ) : null}
      </header>

      {hasBlocks && currentBlock ? (
        <>
          <div className={styles.summary}>
            <span className={styles.summaryEyebrow}>
              <span className={styles.summaryPulse} aria-hidden="true" />
              Right now
            </span>
            <Typography as="p" size="xl" weight="bold" className={styles.summaryTitle}>
              {currentBlock.title}
            </Typography>
            <Typography as="p" size="sm" color="muted" className={styles.summaryDetail}>
              {currentDetail}
            </Typography>
          </div>

          <ol className={styles.timeline}>
            {blocks.map((block, index) => {
              const position = currentIndex < 0 || index < currentIndex
                ? 'past'
                : index === currentIndex
                  ? 'current'
                  : 'upcoming';
              return (
                <BlockRow
                  block={block}
                  position={position}
                  first={index === 0}
                  last={index === blocks.length - 1}
                  key={block.id}
                />
              );
            })}
          </ol>
        </>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <CalendarBlankIcon size={26} weight="regular" />
          </span>
          <div className={styles.emptyCopy}>
            <Typography as="h2" size="lg" weight="bold">Nothing planned today</Typography>
            <Typography as="p" size="sm" color="muted" className={styles.emptyText}>
              Block out focus time, meetings, and breaks to see your day laid out here.
            </Typography>
          </div>
          <Button
            className={styles.scheduleButton}
            variant="primary"
            icon={<CaretRightIcon size={15} aria-hidden="true" />}
          >
            Plan your day
          </Button>
        </div>
      )}
    </section>
  );
}

type BlockRowProps = {
  block: TodayScheduleBlock;
  position: 'past' | 'current' | 'upcoming';
  first: boolean;
  last: boolean;
};

function BlockRow({ block, position, first, last }: BlockRowProps) {
  const minutes = parseMinutes(block.detail);
  const Icon = BLOCK_ICON[block.state];
  const showChip = block.state !== 'later';

  const className = [
    styles.blockRow,
    position === 'past' ? styles.blockPast : '',
    position === 'current' ? styles.blockCurrent : '',
  ].filter(Boolean).join(' ');

  const railClassName = [
    styles.rail,
    first ? styles.railFirst : '',
    last ? styles.railLast : '',
  ].filter(Boolean).join(' ');

  return (
    <li className={className}>
      <Typography as="span" size="sm" weight="semibold" color="muted" className={styles.blockTime}>
        {block.time}
      </Typography>

      <div className={railClassName} aria-hidden="true">
        <span className={styles.node}>
          {Icon ? <Icon size={12} weight="bold" /> : <span className={styles.nodeDot} />}
        </span>
      </div>

      <div className={styles.blockCopy}>
        <div className={styles.blockTitleRow}>
          <Typography as="span" size="base" weight="semibold" className={styles.blockTitle}>
            {block.title}
          </Typography>
          {showChip ? (
            <span className={`${styles.blockChip} ${styles[`chip_${block.state}`]}`}>
              {BLOCK_LABEL[block.state]}
            </span>
          ) : null}
        </div>
        {minutes > 0 ? (
          <Typography as="span" size="sm" color="muted" className={styles.blockDuration}>
            {formatDuration(minutes)}
          </Typography>
        ) : null}
      </div>
    </li>
  );
}
