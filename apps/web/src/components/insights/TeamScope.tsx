import { useState } from 'react';

import { ArrowRightIcon, InfoIcon, WarningIcon } from '@phosphor-icons/react';
import { Button } from '@stride/ui';

import { AreaChart } from './ProjectCharts';
import {
  PROJECT_TREND_WEEKS,
  ROLE_RANK,
  TEAM_VARIANTS,
  teamInsight,
  type MePattern,
  type TeamCoverage,
  type TeamInsight,
  type TeamStat,
  type TeamSuggestion,
  type TeamVariant,
  type WorkspaceRole,
} from './insights.mock';
import styles from './TeamScope.module.css';

// The Team scope of Insights. It is aggregate-only by design — pipeline stages,
// areas, and specs, never people. A variant selector switches between three
// readings of the same week:
//   Flow   — the work pipeline and where it stalls
//   Pulse  — the team's rhythm and momentum
//   Brief  — a written weekly readout
// A Team Admin additionally sees the planning lanes (coverage, planning
// quality, suggested next steps); a Member sees the shared aggregate only.
export function TeamScope({ role }: { role: WorkspaceRole }) {
  const isAdmin = ROLE_RANK[role] >= ROLE_RANK['team-admin'];
  const [variant, setVariant] = useState<TeamVariant>('flow');
  const team = teamInsight;

  return (
    <div className={styles.scope}>
      <div className={styles.topRow}>
        <VariantSelector variant={variant} onChange={setVariant} />
        <span className={styles.weekTag}>{team.weekLabel}</span>
      </div>

      {variant === 'flow' ? (
        <FlowVariant team={team} isAdmin={isAdmin} />
      ) : variant === 'pulse' ? (
        <PulseVariant team={team} isAdmin={isAdmin} />
      ) : (
        <BriefVariant team={team} isAdmin={isAdmin} />
      )}

      <p className={styles.footnote}>
        Team insights are always aggregate — by pipeline stage, area, and spec.
        Stride never shows or ranks individual people here.
      </p>
    </div>
  );
}

type VariantSelectorProps = {
  variant: TeamVariant;
  onChange: (variant: TeamVariant) => void;
};

function VariantSelector({ variant, onChange }: VariantSelectorProps) {
  return (
    <div
      className={styles.variantSelector}
      role="group"
      aria-label="Team insight variant"
    >
      {TEAM_VARIANTS.map(meta => {
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

// --- Variant 1: Flow --------------------------------------------------------

function FlowVariant({ team, isAdmin }: { team: TeamInsight; isAdmin: boolean }) {
  return (
    <>
      <p className={styles.takeaway}>{team.flowTakeaway}</p>

      <div className={styles.pipeline}>
        {team.pipeline.map(stage => (
          <div key={stage.label} className={styles.stage}>
            <span className={styles.stageCount}>{stage.count}</span>
            <span className={styles.stageLabel}>{stage.label}</span>
            <Delta delta={stage.delta} direction={stage.direction} />
          </div>
        ))}
      </div>

      <AreaChart
        points={team.closureTrend}
        labels={PROJECT_TREND_WEEKS}
        tone="accent"
        unit="closed"
        caption="Specs closed per week"
      />

      <div className={styles.lanes}>
        <Lane title="Flow by area">
          <BarList
            rows={team.areas.map(area => ({
              key: area.name,
              label: area.name,
              value: area.specsClosed,
              display: `${area.specsClosed}`,
            }))}
          />
        </Lane>
        <Lane title="Where flow stalls">
          <StallList stalls={team.stalls} />
        </Lane>
      </div>

      {isAdmin ? (
        <>
          <AdminDivider />
          <div className={styles.lanes}>
            <Lane title="Coverage next week">
              <CoverageList coverage={team.coverage} />
            </Lane>
            <Lane title="Worth doing next">
              <SuggestionList suggestions={team.suggestions} withButton />
            </Lane>
          </div>
        </>
      ) : null}
    </>
  );
}

// --- Variant 2: Pulse -------------------------------------------------------

function PulseVariant({ team, isAdmin }: { team: TeamInsight; isAdmin: boolean }) {
  return (
    <>
      <p className={styles.takeaway}>{team.pulseTakeaway}</p>

      <StatStrip stats={team.stats} />

      <AreaChart
        points={team.focusTrend}
        labels={PROJECT_TREND_WEEKS}
        tone="accent"
        unit="h"
        caption="Team focus time per week"
      />

      <div className={styles.lanes}>
        <Lane title="What the team is shipping">
          <BarList
            rows={team.areas.map(area => ({
              key: area.name,
              label: area.name,
              value: area.specsClosed,
              display:
                area.specsClosed === 1
                  ? '1 spec'
                  : `${area.specsClosed} specs`,
            }))}
          />
        </Lane>
        <Lane title="What's been quiet">
          {team.quiet.map(area => (
            <div key={area.name} className={styles.quiet}>
              <span className={styles.quietName}>{area.name}</span>
              <span className={styles.quietDetail}>{area.detail}</span>
            </div>
          ))}
        </Lane>
      </div>

      {isAdmin ? (
        <>
          <AdminDivider />
          <div className={styles.lanes}>
            <Lane title="Planning quality">
              <div className={styles.miniStats}>
                {team.planningQuality.map(stat => (
                  <div key={stat.label} className={styles.miniStat}>
                    <span className={styles.miniStatValue}>{stat.value}</span>
                    <span className={styles.miniStatLabel}>{stat.label}</span>
                    <Delta delta={stat.delta} direction={stat.direction} />
                  </div>
                ))}
              </div>
            </Lane>
            <Lane title="Where momentum could grow">
              <SuggestionList suggestions={team.suggestions} />
            </Lane>
          </div>
        </>
      ) : null}
    </>
  );
}

// --- Variant 3: Brief -------------------------------------------------------

function BriefVariant({ team, isAdmin }: { team: TeamInsight; isAdmin: boolean }) {
  return (
    <>
      <section className={styles.brief}>
        <h3 className={styles.briefTitle}>This week</h3>
        <p className={styles.briefText}>{team.brief}</p>
        <div className={styles.briefStats}>
          {team.stats.map(stat => (
            <div key={stat.label} className={styles.briefStat}>
              <span className={styles.briefStatValue}>{stat.value}</span>
              <span className={styles.briefStatLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.lanes}>
        <Lane title="Where the team put time">
          <BarList
            rows={team.areas.map(area => ({
              key: area.name,
              label: area.name,
              value: area.focusHours,
              display: `${area.focusHours}h`,
            }))}
          />
        </Lane>
        <Lane title="What we noticed">
          <PatternList patterns={team.patterns} />
        </Lane>
      </div>

      {isAdmin ? (
        <>
          <AdminDivider />
          <Lane title="Help the team's momentum">
            <SuggestionList suggestions={team.suggestions} withButton />
          </Lane>
        </>
      ) : null}
    </>
  );
}

// --- Shared pieces ----------------------------------------------------------

function AdminDivider() {
  return (
    <div className={styles.adminDivider}>
      <span className={styles.adminDividerLabel}>Team Admin · planning</span>
    </div>
  );
}

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

type BarRow = {
  key: string;
  label: string;
  value: number;
  display: string;
};

function BarList({ rows }: { rows: BarRow[] }) {
  const max = Math.max(...rows.map(row => row.value), 1);
  return (
    <ul className={styles.bars}>
      {rows.map(row => (
        <li key={row.key} className={styles.barRow}>
          <span className={styles.barLabel}>{row.label}</span>
          <span className={styles.barTrack}>
            <span
              className={styles.barFill}
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </span>
          <span className={styles.barValue}>{row.display}</span>
        </li>
      ))}
    </ul>
  );
}

function StallList({ stalls }: { stalls: TeamInsight['stalls'] }) {
  if (stalls.length === 0) {
    return (
      <p className={styles.laneEmpty}>
        Nothing stalled. Every in-flight spec has moved in the last few days.
      </p>
    );
  }
  return (
    <ul className={styles.stalls}>
      {stalls.map(stall => (
        <li key={stall.sourceKey} className={styles.stall}>
          <span className={styles.stallIcon}>
            <WarningIcon size={14} weight="bold" />
          </span>
          <span className={styles.stallBody}>
            <span className={styles.stallHead}>
              <span className={styles.stallKey}>{stall.sourceKey}</span>
              <span className={styles.stallTitle}>{stall.title}</span>
            </span>
            <span className={styles.stallReason}>
              Idle {stall.idleDays}d · {stall.reason}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function CoverageList({ coverage }: { coverage: TeamCoverage[] }) {
  return (
    <ul className={styles.bars}>
      {coverage.map(row => {
        const pct = Math.min((row.plannedHours / row.capacityHours) * 100, 100);
        const thin = row.plannedHours / row.capacityHours < 0.6;
        return (
          <li key={row.area} className={styles.barRow}>
            <span className={styles.barLabel}>{row.area}</span>
            <span className={styles.barTrack}>
              <span
                className={thin ? styles.barFillThin : styles.barFill}
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className={styles.barValue}>
              {row.plannedHours}h / {row.capacityHours}h
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function SuggestionList({
  suggestions,
  withButton = false,
}: {
  suggestions: TeamSuggestion[];
  withButton?: boolean;
}) {
  return (
    <ul className={styles.suggestions}>
      {suggestions.map(suggestion => (
        <li key={suggestion.title} className={styles.suggestion}>
          <span className={styles.suggestionBody}>
            <span className={styles.suggestionTitle}>{suggestion.title}</span>
            <span className={styles.suggestionDetail}>{suggestion.detail}</span>
          </span>
          {withButton ? (
            <Button
              size="sm"
              variant="secondary"
              className={styles.suggestionButton}
              icon={<ArrowRightIcon size={13} weight="bold" />}
            >
              {suggestion.action}
            </Button>
          ) : (
            <span className={styles.suggestionAction}>{suggestion.action}</span>
          )}
        </li>
      ))}
    </ul>
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
