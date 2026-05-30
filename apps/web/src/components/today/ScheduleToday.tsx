import { useEffect, useState } from 'react';

import { CaretRight } from '@phosphor-icons/react';
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

  const currentIndex = scheduleBlocks.findIndex(block => block.state === 'ready');
  const currentBlock = scheduleBlocks[currentIndex >= 0 ? currentIndex : 0] ?? {
    id: 'empty',
    time: 'No blocks planned',
    title: 'Nothing scheduled yet',
    detail: 'Plan your day from Schedule.',
    state: 'break',
  } satisfies TodayScheduleBlock;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headRow}>
          <Typography as="h1" size="2xl" weight="bold">Today</Typography>
          <Typography as="span" size="base" color="muted">{dateText}</Typography>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryNow}>
            <Typography as="p" size="lg" weight="bold" className={styles.summaryTitle}>
              {currentBlock.title}
            </Typography>
            <Typography as="p" size="sm" color="muted" className={styles.summaryDetail}>
              {`${currentBlock.time} · ${currentBlock.detail}`}
            </Typography>
          </div>
          <Button
            className={styles.scheduleButton}
            variant="secondary"
            icon={<CaretRight size={15} aria-hidden="true" />}
          >
            View today’s schedule
          </Button>
        </div>
      </header>

      <div className={styles.timeline}>
        {scheduleBlocks.map((block, index) => {
          const position = currentIndex < 0 || index < currentIndex
            ? 'past'
            : index === currentIndex
              ? 'current'
              : 'upcoming';
          return (
            <BlockRow block={block} position={position} key={block.id} />
          );
        })}
      </div>
    </section>
  );
}

type BlockRowProps = {
  block: TodayScheduleBlock;
  position: 'past' | 'current' | 'upcoming';
};

function BlockRow({ block, position }: BlockRowProps) {
  const minutes = parseMinutes(block.detail);
  const className = [
    styles.blockRow,
    position === 'past' ? styles.blockPast : '',
    position === 'current' ? styles.blockCurrent : '',
  ].filter(Boolean).join(' ');

  return (
    <article className={className}>
      <Typography as="span" size="sm" weight="semibold" color="muted" className={styles.blockTime}>
        {block.time}
      </Typography>
      <div className={styles.blockCopy}>
        <div className={styles.blockTitleRow}>
          <Typography as="span" size="base" weight="semibold">{block.title}</Typography>
          <Typography as="span" size="xs" weight="semibold" color="muted" className={styles.blockState}>
            {BLOCK_LABEL[block.state]}
          </Typography>
        </div>
        {minutes > 0 ? (
          <Typography as="span" size="sm" color="muted" className={styles.blockDuration}>
            {formatDuration(minutes)}
          </Typography>
        ) : null}
      </div>
    </article>
  );
}
