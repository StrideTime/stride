import { useId, useRef, useState } from 'react';

import type { ProjectHealth, ProjectSource } from './insights.mock';
import styles from './ProjectCharts.module.css';

const HEALTH_TONE: Record<ProjectHealth, ChartTone> = {
  'on-track': 'positive',
  watch: 'neutral',
  'at-risk': 'negative',
};

const HEALTH_LABEL: Record<ProjectHealth, string> = {
  'on-track': 'On track',
  watch: 'Watch',
  'at-risk': 'At risk',
};

// Status dot that never relies on colour alone: it carries an aria-label and
// is always paired with a text label by its callers.
export function HealthDot({ health }: { health: ProjectHealth }) {
  return (
    <span
      className={styles.healthDot}
      data-health={health}
      role="img"
      aria-label={HEALTH_LABEL[health]}
    />
  );
}

// Soft pill for the source tracker a project syncs from.
export function SourceChip({ source }: { source: ProjectSource }) {
  return <span className={styles.sourceChip}>{source}</span>;
}

export { HEALTH_TONE };

// SVG chart primitives shared by the three Projects-scope variants. They are
// pure presentation: every coordinate is computed in a fixed 0..100 viewBox and
// scaled by the container, so the same component works at sparkline and
// full-chart size. Colour comes from the `tone` prop, mapped to app tokens.

export type ChartTone = 'accent' | 'positive' | 'neutral' | 'negative';

const TONE_VAR: Record<ChartTone, string> = {
  accent: 'var(--color-accent)',
  positive: 'var(--color-success)',
  neutral: 'var(--color-text-muted)',
  negative: 'var(--color-danger)',
};

function norm(points: number[], height: number, pad: number): number[] {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const usable = height - pad * 2;
  return points.map(p => height - pad - ((p - min) / span) * usable);
}

type AreaChartProps = {
  points: number[];
  labels: readonly string[];
  tone?: ChartTone;
  unit?: string;
  caption: string;
};

// Full trend chart: filled area, line, hover guide with a value readout.
// One chart, one series at a time, as the Insights surface spec calls for.
export function AreaChart({
  points,
  labels,
  tone = 'accent',
  unit = '',
  caption,
}: AreaChartProps) {
  const gradientId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const height = 132;
  const ys = norm(points, height, 14);
  const step = 100 / (points.length - 1);
  const coords = ys.map((y, i) => ({ x: i * step, y }));

  const line = coords.map(c => `${c.x},${c.y}`).join(' ');
  const area = `0,${height} ${line} 100,${height}`;

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setHover(Math.min(Math.max(index, 0), points.length - 1));
  }

  const active = hover ?? points.length - 1;
  const activeCoord = coords[active]!;
  const formatted =
    unit === '%' ? `${points[active]}%` : `${points[active]} ${unit}`.trim();

  // Keep the tooltip inside the chart at the first and last point.
  const readoutShiftX =
    active === 0 ? '0' : active === points.length - 1 ? '-100%' : '-50%';

  return (
    <figure className={styles.chart}>
      <div
        ref={wrapRef}
        className={styles.chartArea}
        style={{ color: TONE_VAR[tone] }}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg
          className={styles.chartSvg}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill={`url(#${gradientId})`} />
          <polyline
            className={styles.chartLine}
            points={line}
            vectorEffect="non-scaling-stroke"
          />
          {hover !== null ? (
            <line
              className={styles.chartGuide}
              x1={activeCoord.x}
              y1={0}
              x2={activeCoord.x}
              y2={height}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          <circle
            className={styles.chartDot}
            cx={activeCoord.x}
            cy={activeCoord.y}
            r={3}
          />
        </svg>
        <div
          className={styles.chartReadout}
          style={{
            left: `${activeCoord.x}%`,
            top: `${(activeCoord.y / height) * 100}%`,
            transform: `translate(${readoutShiftX}, calc(-100% - 10px))`,
          }}
        >
          <span className={styles.readoutValue}>{formatted}</span>
          <span className={styles.readoutWeek}>{labels[active]}</span>
        </div>
      </div>
      <figcaption className={styles.chartAxis}>
        <span>{labels[0]}</span>
        <span className={styles.chartCaption}>{caption}</span>
        <span>{labels[labels.length - 1]}</span>
      </figcaption>
    </figure>
  );
}

type ProgressBarProps = {
  closed: number;
  total: number;
  tone?: ChartTone;
};

// Thin determinate bar for "X of Y specs closed".
export function ProgressBar({ closed, total, tone = 'accent' }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((closed / total) * 100) : 0;
  return (
    <div
      className={styles.progress}
      style={{ color: TONE_VAR[tone] }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${closed} of ${total} specs closed`}
    >
      <span className={styles.progressFill} style={{ width: `${pct}%` }} />
    </div>
  );
}
