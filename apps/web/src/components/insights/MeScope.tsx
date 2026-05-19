import { useState } from 'react';

import {
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  InfoIcon,
} from '@phosphor-icons/react';
import { Button } from '@stride/ui';

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

// A day is always selected; default to today, falling back to Friday on a
// weekend so the current week opens on its most recent workday.
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

// The Me scope. The current week shows a per-day timeline whose dots narrow
// the stat band to a single day; past weeks are aggregate totals only, so the
// timeline collapses into a week picker and the day selector disappears.
export function MeScope() {
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Weekday>(todayWeekday);

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
  selectedDay: Weekday;
  onSelectDay: (day: Weekday) => void;
};

function CurrentWeek({ week, selectedDay, onSelectDay }: CurrentWeekProps) {
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

  const stats = dayStats(finished, selectedDay, weekMinutes);

  return (
    <>
      <div className={styles.summaryBlock}>
        <div className={styles.summaryHead}>
          <span className={styles.summaryScope}>{DAY_FULL[selectedDay]}</span>
          {selectedDay === today ? (
            <span className={styles.todayChip}>Today</span>
          ) : null}
        </div>
        <StatBand stats={stats} />
      </div>

      <section className={styles.timeline} aria-label="Completed work by day">
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
                  aria-label={`Show ${DAY_FULL[day.day]} stats`}
                  disabled={day.isFuture}
                  onClick={() => onSelectDay(day.day)}
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
