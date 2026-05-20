import type { CSSProperties } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { Popover } from '@stride/ui';

import {
  activeTimeBudget,
  getBudgetSummary,
  type TimeBudgetAllocation,
  type ScheduleBlock,
  type ScheduleMode,
} from './schedule.mock';
import { formatDuration } from './ScheduleShared';
import styles from './ScheduleBudgetSummary.module.css';

type ScheduleBudgetSummaryProps = {
  mode: ScheduleMode;
  plannedBlocks: ScheduleBlock[];
  actualBlocks: ScheduleBlock[];
  periodStart: string;
  periodEnd: string;
  visibleDate?: string;
  compact?: boolean;
};

export function ScheduleBudgetSummary({
  mode,
  plannedBlocks,
  actualBlocks,
  periodStart,
  periodEnd,
  visibleDate,
}: ScheduleBudgetSummaryProps) {
  const sourceBlocks = mode === 'plan' ? plannedBlocks : actualBlocks;
  const budgetSummary = getBudgetSummary({
    budget: activeTimeBudget,
    blocks: sourceBlocks,
    periodStart,
    periodEnd,
    visibleDate,
  });
  const budgetItems = budgetSummary.allocations;
  const periodLabel = activeTimeBudget.period === 'weekly' ? 'weekly' : 'daily';
  const relevantItems = budgetItems.filter(item => item.relevant);
  const primaryItem = relevantItems[0];

  return (
    <section className={styles.budgetSummary} aria-label={`${periodLabel} time budget`}>
      <Popover
        side="bottom"
        align="start"
        triggerClassName={styles.summaryTrigger}
        popupClassName={styles.budgetPopup}
        trigger={(
          <span className={styles.triggerContent}>
            <span className={styles.triggerLabel}>{capitalize(periodLabel)} budget</span>
            <span className={styles.triggerValue}>
              {relevantItems.length
                ? `${formatDuration(budgetSummary.usedMin)} / ${formatDuration(budgetSummary.totalMin)}`
                : `${formatDuration(0)} / ${formatDuration(budgetSummary.totalMin)}`}
            </span>
            {primaryItem ? (
              <span className={styles.triggerDetail}>
                {primaryItem.label}: {formatDuration(primaryItem.usedMin)} / {formatDuration(primaryItem.targetMin)}
              </span>
            ) : null}
          </span>
        )}
      >
        <BudgetPopup
          periodLabel={periodLabel}
          summary={budgetSummary}
          items={relevantItems.length ? relevantItems : budgetItems}
        />
      </Popover>
    </section>
  );
}

function BudgetPopup({
  periodLabel,
  summary,
  items,
}: {
  periodLabel: string;
  summary: ReturnType<typeof getBudgetSummary>;
  items: TimeBudgetAllocation[];
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.popupContent}>
      <div className={styles.popupHeader}>
        <span className={styles.popupTitle}>{capitalize(periodLabel)} budget</span>
        <button
          className={styles.editButton}
          type="button"
          onClick={() => navigate({ to: '/settings' })}
        >
          Edit in settings
        </button>
      </div>
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>{capitalize(periodLabel)} total</span>
        <span className={styles.totalValue}>
          {formatDuration(summary.usedMin)} / {formatDuration(summary.totalMin)}
        </span>
        <span className={styles.totalTrack} aria-hidden="true">
          <span
            className={styles.totalFill}
            style={{ '--progress': `${Math.min(summary.ratio, 1) * 100}%` } as CSSProperties}
          />
        </span>
      </div>
      <div className={styles.budgetList}>
        {items.map(item => (
          <BudgetReadRow key={item.typeId} item={item} />
        ))}
      </div>
    </div>
  );
}

function BudgetReadRow({ item }: { item: TimeBudgetAllocation }) {
  return (
    <div
      className={styles.budgetRow}
      data-status={item.status}
      style={{
        '--budget-color': item.color,
        '--progress': `${Math.min(item.ratio, 1) * 100}%`,
      } as CSSProperties}
    >
      <span className={styles.rowName}>{item.label}</span>
      <span className={styles.rowValue}>
        {formatDuration(item.usedMin)} / {formatDuration(item.targetMin)}
      </span>
      <span className={styles.rowPercent}>{Math.round(item.percentOfTotal * 100)}%</span>
      <span className={styles.rowTrack} aria-hidden="true">
        <span className={styles.rowFill} />
      </span>
    </div>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
