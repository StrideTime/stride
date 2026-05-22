import { Fragment, useEffect, useState } from 'react';

import { Badge, Typography } from '@stride/ui';

import { scheduleBlocks, type TodayScheduleBlock } from './today.mock';
import styles from './ScheduleToday.module.css';

const WORKING_DAY_MIN = 8 * 60;

const BLOCK_BADGE: Record<TodayScheduleBlock['state'], { label: string; variant: 'accent' | 'neutral' | 'success' }> = {
  ready: { label: 'Work', variant: 'success' },
  later: { label: 'Work', variant: 'neutral' },
  meeting: { label: 'Meeting', variant: 'accent' },
  done: { label: 'Done', variant: 'neutral' },
  break: { label: 'Break', variant: 'neutral' },
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

  const totals = scheduleBlocks.reduce(
    (acc, block) => {
      const min = parseMinutes(block.detail);
      if (block.state === 'done') acc.worked += min;
      else acc.ahead += min;
      if (block.state === 'meeting') acc.meetings += min;
      return acc;
    },
    { worked: 0, ahead: 0, meetings: 0 },
  );
  const planned = totals.worked + totals.ahead;
  const scale = Math.max(WORKING_DAY_MIN, planned);
  const currentIndex = scheduleBlocks.findIndex(block => block.state === 'ready');

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headRow}>
          <Typography as="h1" size="2xl" weight="bold">Today</Typography>
          <Typography as="span" size="sm" color="muted">{dateText}</Typography>
        </div>

        <div className={styles.summary}>
          <div className={styles.statStrip}>
            <Stat label="Worked" value={formatDuration(totals.worked)} />
            <Stat label="Planned ahead" value={formatDuration(totals.ahead)} />
            <Stat label="In meetings" value={formatDuration(totals.meetings)} />
          </div>
          <div className={styles.capacity}>
            <div className={styles.capacityTrack}>
              <span
                className={styles.segWorked}
                style={{ width: `${(totals.worked / scale) * 100}%` }}
              />
              <span
                className={styles.segAhead}
                style={{ width: `${(totals.ahead / scale) * 100}%` }}
              />
            </div>
            <Typography as="span" size="xs" color="muted">
              {planned > WORKING_DAY_MIN
                ? `${formatDuration(planned)} planned, over your ${formatDuration(WORKING_DAY_MIN)} day`
                : `${formatDuration(planned)} planned of an ${formatDuration(WORKING_DAY_MIN)} day · ${formatDuration(WORKING_DAY_MIN - planned)} free`}
            </Typography>
          </div>
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
            <Fragment key={block.id}>
              {position === 'current' ? (
                <div className={styles.nowLine}>
                  <span className={styles.nowDot} aria-hidden="true" />
                  <Typography as="span" size="xs" weight="semibold" className={styles.nowLabel}>
                    Now
                  </Typography>
                </div>
              ) : null}
              <BlockRow block={block} position={position} />
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <Typography as="span" size="lg" weight="bold">{value}</Typography>
      <Typography as="span" size="xs" weight="semibold" color="muted" className={styles.statLabel}>
        {label}
      </Typography>
    </div>
  );
}

type BlockRowProps = {
  block: TodayScheduleBlock;
  position: 'past' | 'current' | 'upcoming';
};

function BlockRow({ block, position }: BlockRowProps) {
  const badge = BLOCK_BADGE[block.state];
  const minutes = parseMinutes(block.detail);
  const className = [
    styles.blockRow,
    position === 'past' ? styles.blockPast : '',
    position === 'current' ? styles.blockCurrent : '',
  ].filter(Boolean).join(' ');

  return (
    <article className={className}>
      <Typography as="span" size="xs" weight="semibold" color="muted" className={styles.blockTime}>
        {block.time}
      </Typography>
      <div className={styles.blockCopy}>
        <Typography as="span" size="sm" weight="semibold">{block.title}</Typography>
        <Typography as="span" size="xs" color="muted">{block.detail}</Typography>
      </div>
      <div className={styles.blockMeta}>
        {minutes > 0 ? (
          <Typography as="span" size="xs" weight="semibold" color="muted" className={styles.blockDuration}>
            {formatDuration(minutes)}
          </Typography>
        ) : null}
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
    </article>
  );
}
