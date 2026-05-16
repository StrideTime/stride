import type { ReactNode } from 'react';

import {
  ArrowRightIcon,
  CaretDoubleUpIcon,
  CaretRightIcon,
  CaretUpIcon,
} from '@phosphor-icons/react';
import { Badge, Button, Typography } from '@stride/ui';

import {
  attentionItems,
  priorityActions,
  scheduleBlocks,
  todayStats,
  type TodayAttentionItem,
  type TodayPriorityAction,
  type TodayScheduleBlock,
} from './today.mock';
import styles from './TodayView.module.css';

type PanelHeaderProps = {
  title: string;
  action?: ReactNode;
};

type AttentionRowProps = {
  item: TodayAttentionItem;
};

type PriorityRowProps = {
  action: TodayPriorityAction;
  rank: number;
};

type TimeBlockProps = {
  block: TodayScheduleBlock;
};

const SCHEDULE_BADGE_VARIANTS: Record<TodayScheduleBlock['state'], BadgeVariant> = {
  break: 'neutral',
  done: 'neutral',
  later: 'warning',
  meeting: 'accent',
  ready: 'success',
};

const SCHEDULE_STATUS_LABELS: Record<TodayScheduleBlock['state'], string> = {
  break: 'Open',
  done: 'Done',
  later: 'Planned',
  meeting: 'Meeting',
  ready: 'Ready now',
};

type BadgeVariant = 'accent' | 'danger' | 'neutral' | 'success' | 'warning';

export function TodayView() {
  return (
    <section className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.intro}>
          <Typography as="h1" size="2xl" weight="bold">
            What needs your next move?
          </Typography>
        </div>
      </header>

      <div className={styles.workspace}>
        <StatsPanel />
        <div className={styles.mainGrid}>
          <SchedulePanel />
          <div className={styles.sideColumn}>
            <AttentionPanel />
            <PriorityPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

function SchedulePanel() {
  return (
    <section className={styles.schedulePanel}>
      <PanelHeader
        title="Scheduled blocks"
        action={<PanelLink label="View schedule" />}
      />
      <div className={styles.timelineList}>
        {scheduleBlocks.map(block => <TimeBlock key={block.id} block={block} />)}
      </div>
    </section>
  );
}

function AttentionPanel() {
  return (
    <section className={styles.panel}>
      <PanelHeader title="Needs attention" action={<PanelLink label="View inbox" />} />
      <ul className={styles.attentionList}>
        {attentionItems.map(item => <AttentionRow key={item.id} item={item} />)}
      </ul>
    </section>
  );
}

function PriorityPanel() {
  return (
    <section className={styles.panel}>
      <PanelHeader title="Ready to schedule" action={<PanelLink label="Schedule now" />} />
      <ul className={styles.priorityList}>
        {priorityActions.map((action, index) => (
          <PriorityRow key={action.id} action={action} rank={index + 1} />
        ))}
      </ul>
    </section>
  );
}

function StatsPanel() {
  return (
    <section className={styles.statsPanel}>
      <PanelHeader title="Progress" />
      <div className={styles.statsGrid}>
        {todayStats.map(stat => (
          <div key={stat.label} className={styles.statCard}>
            <Typography size="xs" color="muted">
              {stat.label}
            </Typography>
            <Typography size="lg" weight="bold">
              {stat.value}
            </Typography>
          </div>
        ))}
      </div>
    </section>
  );
}

function PanelHeader({ title, action }: PanelHeaderProps) {
  return (
    <div className={styles.panelHeader}>
      <Typography as="h2" size="lg" weight="bold">
        {title}
      </Typography>
      {action}
    </div>
  );
}

function PanelLink({ label }: { label: string }) {
  return (
    <button className={styles.panelLink} type="button">
      <Typography size="xs" weight="semibold" color="muted">
        {label}
      </Typography>
      <CaretRightIcon className={styles.panelLinkIcon} size={16} weight="bold" />
    </button>
  );
}

function AttentionRow({ item }: AttentionRowProps) {
  return (
    <li className={styles.attentionRow}>
      <div className={styles.rowMain}>
        <Typography weight="semibold">{item.title}</Typography>
        <div className={styles.rowMeta}>
          <Badge variant={item.tone}>{item.label}</Badge>
          <Typography size="xs" color="muted">
            {item.detail}
          </Typography>
        </div>
      </div>
      <Button
        className={styles.iconRightButton}
        size="sm"
        variant="secondary"
        icon={<ArrowRightIcon size={15} />}
      >
        {item.action}
      </Button>
    </li>
  );
}

function PriorityRow({ action, rank }: PriorityRowProps) {
  const PriorityIcon = action.priority === 'Highest' ? CaretDoubleUpIcon : CaretUpIcon;

  return (
    <li className={styles.priorityRow}>
      <div className={styles.rankBadge} aria-hidden="true">
        {rank}
      </div>
      <div className={styles.rowMain}>
        <Typography weight="semibold">{action.title}</Typography>
        <div className={styles.rowMeta}>
          <span className={styles.priorityIcon} aria-label={`${action.priority} priority`}>
            <PriorityIcon size={14} weight="bold" />
          </span>
          <Typography size="xs" color="muted">
            {action.sourceKey} · {action.actual} / {action.estimate ?? 'No estimate'}
          </Typography>
        </div>
      </div>
    </li>
  );
}

function TimeBlock({ block }: TimeBlockProps) {
  const className = block.state === 'ready'
    ? `${styles.timeBlock} ${styles.timeBlockReady}`
    : styles.timeBlock;

  return (
    <article className={className}>
      <div className={styles.timeBlockTime}>
        <Typography size="sm" weight="semibold" color="muted">
          {block.time}
        </Typography>
        <Badge variant={SCHEDULE_BADGE_VARIANTS[block.state]}>
          {SCHEDULE_STATUS_LABELS[block.state]}
        </Badge>
      </div>
      <div className={styles.timeBlockCopy}>
        <Typography size="base" weight="semibold">
          {block.title}
        </Typography>
        <Typography size="xs" color="muted">
          {block.detail}
        </Typography>
      </div>
      <div className={styles.timeBlockActions}>
        <Button size="sm" variant="secondary">Start</Button>
      </div>
    </article>
  );
}
