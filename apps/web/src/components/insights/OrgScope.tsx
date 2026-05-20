import { useState } from 'react';

import { ClockIcon, FlagIcon, InfoIcon } from '@phosphor-icons/react';

import { AreaChart, HealthDot, HEALTH_TONE, ProgressBar } from './ProjectCharts';
import {
  HEALTH_META,
  ORG_VARIANTS,
  PROJECT_TREND_WEEKS,
  orgInsight,
  type MePattern,
  type OrgInitiative,
  type OrgInsight,
  type OrgVariant,
  type TeamStat,
} from './insights.mock';
import styles from './OrgScope.module.css';

// The Org scope of Insights — workspace-wide, Workspace Admin only. Everything
// is initiative- or stage-level; nothing is keyed to a team or a person, so the
// surface never ranks teams. A variant selector switches between three
// readings of the same quarter:
//   Portfolio    — what initiatives exist and their state
//   Forecast     — whether committed work will land, and when
//   Flow health  — whether delivery is healthy as a system
export function OrgScope() {
  const [variant, setVariant] = useState<OrgVariant>('portfolio');
  const org = orgInsight;

  return (
    <div className={styles.scope}>
      <div className={styles.topRow}>
        <VariantSelector variant={variant} onChange={setVariant} />
        <span className={styles.periodTag}>{org.periodLabel}</span>
      </div>

      {variant === 'portfolio' ? (
        <PortfolioVariant org={org} />
      ) : variant === 'forecast' ? (
        <ForecastVariant org={org} />
      ) : (
        <FlowVariant org={org} />
      )}

      <p className={styles.footnote}>
        Org insights are workspace-wide and aggregate by initiative. Stride
        never ranks teams or individuals here.
      </p>
    </div>
  );
}

type VariantSelectorProps = {
  variant: OrgVariant;
  onChange: (variant: OrgVariant) => void;
};

function VariantSelector({ variant, onChange }: VariantSelectorProps) {
  return (
    <div
      className={styles.variantSelector}
      role="group"
      aria-label="Org insight variant"
    >
      {ORG_VARIANTS.map(meta => {
        const active = meta.variant === variant;
        return (
          <button
            key={meta.variant}
            type="button"
            className={active ? styles.variantButtonActive : styles.variantButton}
            aria-pressed={active}
            onClick={() => onChange(meta.variant)}
          >
            <span className={styles.variantLabel}>{meta.label}</span>
            <span className={styles.variantBlurb}>{meta.blurb}</span>
          </button>
        );
      })}
    </div>
  );
}

// --- Variant 1: Portfolio ---------------------------------------------------

function PortfolioVariant({ org }: { org: OrgInsight }) {
  return (
    <>
      <p className={styles.takeaway}>{org.portfolioTakeaway}</p>

      <StatStrip stats={org.portfolioStats} />

      <section aria-label="Initiatives">
        <h3 className={styles.laneTitle}>Initiative status</h3>
        <ul className={styles.initiatives}>
          {org.initiatives.map(initiative => (
            <InitiativeRow key={initiative.id} initiative={initiative} />
          ))}
        </ul>
      </section>

      <Lane title="What we noticed">
        <PatternList patterns={org.patterns} />
      </Lane>
    </>
  );
}

function InitiativeRow({ initiative }: { initiative: OrgInitiative }) {
  return (
    <li className={styles.initiative}>
      <div className={styles.initiativeHead}>
        <span className={styles.initiativeName}>
          <HealthDot health={initiative.health} />
          {initiative.name}
        </span>
        <span className={styles.healthPill} data-health={initiative.health}>
          {HEALTH_META[initiative.health].label}
        </span>
      </div>
      <p className={styles.initiativeNote}>{initiative.note}</p>
      <div className={styles.initiativeMeters}>
        <ProgressBar
          closed={initiative.specsClosed}
          total={initiative.specsTotal}
          tone={HEALTH_TONE[initiative.health]}
        />
        <span className={styles.initiativeMeta}>
          <span className={styles.initiativeCount}>
            {initiative.specsClosed}/{initiative.specsTotal} specs
          </span>
          <span className={styles.initiativeDot} aria-hidden="true">
            ·
          </span>
          <span>{initiative.cycleTimeDays}d cycle</span>
          <span className={styles.initiativeDot} aria-hidden="true">
            ·
          </span>
          <span>forecast {initiative.forecastDate}</span>
        </span>
      </div>
    </li>
  );
}

// --- Variant 2: Forecast ----------------------------------------------------

function ForecastVariant({ org }: { org: OrgInsight }) {
  const onTrack = org.initiatives.filter(i => i.health === 'on-track');
  const slipping = org.initiatives.filter(i => i.health !== 'on-track');

  return (
    <>
      <p className={styles.takeaway}>{org.forecastTakeaway}</p>

      <StatStrip stats={org.forecastStats} />

      <AreaChart
        points={org.closureBurnup}
        labels={PROJECT_TREND_WEEKS}
        tone="accent"
        unit="closed"
        caption="Specs closed, cumulative — 168 committed"
      />

      <div className={styles.lanes}>
        <Lane title="On track to land">
          <ForecastList initiatives={onTrack} />
        </Lane>
        <Lane title="At risk of slipping">
          <ForecastList initiatives={slipping} />
        </Lane>
      </div>
    </>
  );
}

function ForecastList({ initiatives }: { initiatives: OrgInitiative[] }) {
  if (initiatives.length === 0) {
    return <p className={styles.laneEmpty}>Nothing here this quarter.</p>;
  }
  return (
    <ul className={styles.forecastList}>
      {initiatives.map(initiative => (
        <li key={initiative.id} className={styles.forecastRow}>
          <span className={styles.forecastIcon} data-health={initiative.health}>
            <FlagIcon size={13} weight="bold" />
          </span>
          <span className={styles.forecastBody}>
            <span className={styles.forecastHead}>
              <span className={styles.forecastName}>{initiative.name}</span>
              <span className={styles.forecastDate}>
                {initiative.forecastDate}
              </span>
            </span>
            <span className={styles.forecastNote}>{initiative.note}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// --- Variant 3: Flow health -------------------------------------------------

function FlowVariant({ org }: { org: OrgInsight }) {
  return (
    <>
      <p className={styles.takeaway}>{org.flowTakeaway}</p>

      <StatStrip stats={org.flowStats} />

      <AreaChart
        points={org.cycleTrend}
        labels={PROJECT_TREND_WEEKS}
        tone="accent"
        unit="d"
        caption="Median cycle time per week"
      />

      <div className={styles.lanes}>
        <Lane title="Where work piles up">
          <StageList stages={org.stageLoad} />
        </Lane>
        <Lane title="Aging work">
          <AgingList items={org.agingWork} />
        </Lane>
      </div>
    </>
  );
}

function StageList({ stages }: { stages: OrgInsight['stageLoad'] }) {
  const max = Math.max(...stages.map(stage => stage.count), 1);
  return (
    <ul className={styles.bars}>
      {stages.map(stage => (
        <li key={stage.stage} className={styles.barRow}>
          <span className={styles.barLabel}>{stage.stage}</span>
          <span className={styles.barTrack}>
            <span
              className={styles.barFill}
              style={{ width: `${(stage.count / max) * 100}%` }}
            />
          </span>
          <span className={styles.barValue}>{stage.count}</span>
        </li>
      ))}
    </ul>
  );
}

function AgingList({ items }: { items: OrgInsight['agingWork'] }) {
  return (
    <ul className={styles.aging}>
      {items.map(item => (
        <li key={item.sourceKey} className={styles.agingRow}>
          <span className={styles.agingIcon}>
            <ClockIcon size={14} weight="bold" />
          </span>
          <span className={styles.agingBody}>
            <span className={styles.agingHead}>
              <span className={styles.agingKey}>{item.sourceKey}</span>
              <span className={styles.agingTitle}>{item.title}</span>
            </span>
            <span className={styles.agingReason}>
              Open {item.openDays}d · {item.stage}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// --- Shared pieces ----------------------------------------------------------

function Delta({
  delta,
  direction,
}: {
  delta: string;
  direction: 'up' | 'flat';
}) {
  return (
    <span className={direction === 'up' ? styles.deltaUp : styles.delta}>
      {delta}
    </span>
  );
}

function StatStrip({ stats }: { stats: TeamStat[] }) {
  return (
    <div className={styles.statStrip}>
      {stats.map(stat => (
        <div key={stat.label} className={styles.stat}>
          <span className={styles.statValue}>{stat.value}</span>
          <span className={styles.statLabel}>{stat.label}</span>
          <Delta delta={stat.delta} direction={stat.direction} />
        </div>
      ))}
    </div>
  );
}

function Lane({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.lane}>
      <h3 className={styles.laneTitle}>{title}</h3>
      {children}
    </section>
  );
}

function PatternList({ patterns }: { patterns: MePattern[] }) {
  return (
    <ul className={styles.patterns}>
      {patterns.map(pattern => (
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
  );
}
