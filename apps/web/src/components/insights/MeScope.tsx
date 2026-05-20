import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  InfoIcon,
} from '@phosphor-icons/react';
import { Button } from '@stride/ui';

import {
  activeTimeBudget,
  getBudgetProgress,
  plannedBlocks,
} from '../schedule/schedule.mock';
import { formatDuration } from '../schedule/ScheduleShared';
import { meWeeks, type FinishedItem, type MeWeek } from './insights.mock';
import styles from './MeScope.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
type Weekday = (typeof WEEKDAYS)[number];

const DAY_FULL: Record<Weekday, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
};

// No day is selected by default: the stat band reads as the week total. On a
// weekday, today is the natural fallback for "what does today look like" when
// a day is selected; on weekends, the most recent workday stands in.
function todayWeekday(): Weekday {
  const byIndex: Record<number, Weekday> = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
  };
  return byIndex[new Date().getDay()] ?? 'Fri';
}

type SummaryStat = {
  label: string;
  value: string;
  delta?: string;
  direction?: 'up' | 'flat';
};

// timeLogged strings look like "3h 05m", "45m", "1h 12m".
function toMinutes(timeLogged: string): number {
  const hours = /(\d+)\s*h/.exec(timeLogged);
  const mins = /(\d+)\s*m/.exec(timeLogged);
  return (hours ? Number(hours[1]) * 60 : 0) + (mins ? Number(mins[1]) : 0);
}

function formatHm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function loadFor(finished: FinishedItem[], day: string): number {
  return finished
    .filter(item => item.day === day)
    .reduce((sum, item) => sum + toMinutes(item.timeLogged), 0);
}

function dayStats(
  finished: FinishedItem[],
  day: Weekday,
  weekMinutes: number,
): SummaryStat[] {
  const items = finished.filter(item => item.day === day);
  const minutes = items.reduce(
    (sum, item) => sum + toMinutes(item.timeLogged),
    0,
  );
  const specs = items.filter(item => item.kind === 'Spec').length;
  const share = weekMinutes > 0 ? Math.round((minutes / weekMinutes) * 100) : 0;

  return [
    { label: 'Focus time', value: minutes > 0 ? formatHm(minutes) : '—' },
    { label: 'Items completed', value: String(items.length) },
    { label: 'Specs closed', value: String(specs) },
    { label: 'Share of week', value: `${share}%` },
  ];
}

// The Me scope. The current week opens on its weekly totals; clicking a day
// in the timeline narrows the stat band to that day, and clicking the same
// day again toggles back to the week. Past weeks are aggregate totals only,
// so the timeline collapses into a week picker and the day selector disappears.
export function MeScope() {
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Weekday | null>(null);

  const week = meWeeks[weekIndex]!;

  return (
    <div className={styles.scope}>
      <div className={styles.weekNav}>
        <button
          type="button"
          className={styles.weekNavButton}
          aria-label="Previous week"
          disabled={weekIndex >= meWeeks.length - 1}
          onClick={() => setWeekIndex(weekIndex + 1)}
        >
          <CaretLeftIcon size={15} weight="bold" />
        </button>
        <span className={styles.weekNavLabel}>
          <span className={styles.weekNavName}>{week.label}</span>
          {week.isCurrent ? (
            <span className={styles.weekNavTag}>This week</span>
          ) : null}
        </span>
        <button
          type="button"
          className={styles.weekNavButton}
          aria-label="Next week"
          disabled={weekIndex <= 0}
          onClick={() => setWeekIndex(weekIndex - 1)}
        >
          <CaretRightIcon size={15} weight="bold" />
        </button>
      </div>

      {week.isCurrent ? (
        <CurrentWeek
          week={week}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      ) : (
        <PastWeek week={week} />
      )}
    </div>
  );
}

type CurrentWeekProps = {
  week: MeWeek;
  selectedDay: Weekday | null;
  onSelectDay: (day: Weekday | null) => void;
};

function CurrentWeek({ week, selectedDay, onSelectDay }: CurrentWeekProps) {
  // Clicking anywhere outside the timeline clears the day selection so the
  // stat band returns to the week total. The listener only attaches while a
  // day is actually selected to avoid running on every page interaction.
  const timelineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!selectedDay) return;
    function handleOutside(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && !timelineRef.current?.contains(target)) {
        onSelectDay(null);
      }
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [selectedDay, onSelectDay]);

  const finished = week.finished ?? [];

  const weekMinutes = WEEKDAYS.reduce(
    (sum, day) => sum + loadFor(finished, day),
    0,
  );
  const peakMinutes = Math.max(
    ...WEEKDAYS.map(day => loadFor(finished, day)),
    1,
  );

  const today = todayWeekday();
  const todayIndex = WEEKDAYS.indexOf(today);

  const days = WEEKDAYS.map((day, index) => {
    const minutes = loadFor(finished, day);
    return {
      day,
      minutes,
      items: finished.filter(item => item.day === day),
      isPeak: minutes === peakMinutes && minutes > 0,
      isFuture: index > todayIndex,
    };
  });

  const stats = selectedDay
    ? dayStats(finished, selectedDay, weekMinutes)
    : week.stats;

  return (
    <>
      <div className={styles.summaryBlock}>
        <div className={styles.summaryHead}>
          <span className={styles.summaryScope}>
            {selectedDay ? DAY_FULL[selectedDay] : 'This week'}
          </span>
          {selectedDay && selectedDay === today ? (
            <span className={styles.todayChip}>Today</span>
          ) : null}
        </div>
        <StatBand stats={stats} />
      </div>

      <section
        ref={timelineRef}
        className={styles.timeline}
        aria-label="Completed work by day"
      >
        {days.map(day => {
          const isSelected = day.day === selectedDay;
          const markerClass = isSelected
            ? styles.markerSelected
            : day.minutes > 0
              ? day.isPeak
                ? styles.markerPeak
                : styles.marker
              : styles.markerEmpty;

          return (
            <div
              key={day.day}
              className={
                day.isFuture ? `${styles.day} ${styles.dayFuture}` : styles.day
              }
            >
              <div className={styles.dayHead}>
                <button
                  type="button"
                  className={styles.dayDot}
                  aria-pressed={isSelected}
                  aria-label={
                    isSelected
                      ? `Hide ${DAY_FULL[day.day]} stats, show the week`
                      : `Show ${DAY_FULL[day.day]} stats`
                  }
                  disabled={day.isFuture}
                  onClick={() =>
                    onSelectDay(day.day === selectedDay ? null : day.day)
                  }
                >
                  <span className={markerClass} aria-hidden="true" />
                </button>
              </div>
              <div className={styles.dayMeta}>
                <span className={styles.dayName}>{day.day}</span>
                <span className={styles.dayLoad}>
                  {day.minutes > 0
                    ? formatHm(day.minutes)
                    : day.isFuture
                      ? 'Upcoming'
                      : 'Nothing logged'}
                </span>
              </div>
              <ol className={styles.items}>
                {day.items.map(item => (
                  <li key={item.id} className={styles.item}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemMeta}>
                      <span className={styles.itemRef}>
                        {item.sourceKey || item.kind}
                      </span>
                      <span className={styles.itemTime}>{item.timeLogged}</span>
                    </span>
                  </li>
                ))}
                {day.items.length === 0 ? (
                  <li className={styles.itemEmpty} aria-hidden="true" />
                ) : null}
              </ol>
            </div>
          );
        })}
      </section>

      <div className={styles.lower}>
        <BudgetPanel />
        <PatternsPanel week={week} />
        <section className={styles.panel}>
          <h3 className={styles.panelTitle}>Worth doing next</h3>
          <ul className={styles.suggestions}>
            {(week.suggestions ?? []).map(suggestion => (
              <li key={suggestion.title} className={styles.suggestion}>
                <span className={styles.suggestionBody}>
                  <span className={styles.suggestionTitle}>
                    {suggestion.title}
                  </span>
                  <span className={styles.suggestionDetail}>
                    {suggestion.detail}
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className={styles.suggestionButton}
                  icon={<ArrowRightIcon size={13} weight="bold" />}
                >
                  {suggestion.action}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function BudgetPanel() {
  const budgetItems = getBudgetProgress({
    budget: activeTimeBudget,
    blocks: plannedBlocks,
    periodStart: '2026-05-17',
    periodEnd: '2026-05-23',
  });

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeaderRow}>
        <h3 className={styles.panelTitle}>Time budget</h3>
        <span className={styles.panelMeta}>Private · Planned</span>
      </div>
      <ul className={styles.budgetList}>
        {budgetItems.map(item => (
          <li key={item.typeId} className={styles.budgetItem} data-status={item.status}>
            <span className={styles.budgetItemHead}>
              <span className={styles.budgetName}>{item.label}</span>
              <span className={styles.budgetValue}>
                {formatDuration(item.usedMin)} / {formatDuration(item.targetMin)}
              </span>
            </span>
            <span className={styles.budgetTrack} aria-hidden="true">
              <span
                className={styles.budgetFill}
                style={{ '--progress': `${Math.min(item.ratio, 1) * 100}%` } as CSSProperties}
              />
            </span>
            <span className={styles.budgetHint}>{getBudgetHint(item.status)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function getBudgetHint(status: ReturnType<typeof getBudgetProgress>[number]['status']) {
  const hints = {
    under: 'Plenty of room left.',
    near: 'Close to the cap.',
    onTrack: 'On track.',
    over: 'Over target.',
    behind: 'Needs time planned.',
  };

  return hints[status];
}

function PastWeek({ week }: { week: MeWeek }) {
  return (
    <>
      <div className={styles.summaryBlock}>
        <StatBand stats={week.stats} />
      </div>
      <PatternsPanel week={week} />
    </>
  );
}

function StatBand({ stats }: { stats: SummaryStat[] }) {
  return (
    <div className={styles.summary}>
      {stats.map(stat => (
        <div key={stat.label} className={styles.summaryStat}>
          <span className={styles.summaryValue}>{stat.value}</span>
          <span className={styles.summaryLabel}>{stat.label}</span>
          {stat.delta ? (
            <span
              className={
                stat.direction === 'up'
                  ? styles.summaryDeltaUp
                  : styles.summaryDelta
              }
            >
              {stat.delta}
            </span>
          ) : (
            <span className={styles.summaryDelta} aria-hidden="true">
              &nbsp;
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function PatternsPanel({ week }: { week: MeWeek }) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>What we noticed</h3>
      <ul className={styles.patterns}>
        {week.patterns.map(pattern => (
          <li key={pattern.title} className={styles.pattern}>
            <span className={styles.patternIcon}>
              <InfoIcon size={13} weight="bold" />
            </span>
            <span className={styles.patternBody}>
              <span className={styles.patternTitle}>{pattern.title}</span>
              <span className={styles.patternDetail}>{pattern.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
