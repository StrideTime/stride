import { useState } from 'react';

import { ArrowRightIcon, WarningIcon } from '@phosphor-icons/react';
import { Button } from '@stride/ui';

import {
  AreaChart,
  HEALTH_TONE,
  HealthDot,
  ProgressBar,
  SourceChip,
} from './ProjectCharts';
import {
  HEALTH_META,
  PROJECT_TREND_WEEKS,
  projects,
  type ProjectInsight,
} from './insights.mock';
import styles from './ProjectsScope.module.css';

// The Projects scope of Insights: a master / detail layout. The rail is the
// whole portfolio at a glance; the panel is one project in depth. Built for the
// reader who wants to drill, not scan, with the rail keeping the rest of the
// portfolio in peripheral view. Every field is a project-level total, so the
// same view is safe for a Member, a Team Admin, and a Workspace Admin.
export function ProjectsScope() {
  const [selectedId, setSelectedId] = useState(projects[0]!.id);
  const selected = projects.find(p => p.id === selectedId) ?? projects[0]!;
  const needAttention = projects.filter(p => p.health !== 'on-track').length;

  return (
    <div className={styles.scope}>
      <nav className={styles.rail} aria-label="Projects">
        <p className={styles.railSummary}>
          {projects.length} projects
          <span className={styles.railSummaryDim}>
            {needAttention} need attention
          </span>
        </p>
        <ul className={styles.railList}>
          {projects.map(project => {
            const total = project.specsClosed + project.specsOpen;
            const active = project.id === selectedId;
            return (
              <li key={project.id}>
                <button
                  type="button"
                  className={active ? styles.railItemActive : styles.railItem}
                  aria-pressed={active}
                  onClick={() => setSelectedId(project.id)}
                >
                  <span className={styles.railTop}>
                    <HealthDot health={project.health} />
                    <span className={styles.railName}>{project.name}</span>
                  </span>
                  <span className={styles.railCount}>
                    {project.specsClosed}/{total} specs closed
                  </span>
                  <ProgressBar
                    closed={project.specsClosed}
                    total={total}
                    tone={HEALTH_TONE[project.health]}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <ProjectDetail project={selected} />
    </div>
  );
}

function ProjectDetail({ project }: { project: ProjectInsight }) {
  const total = project.specsClosed + project.specsOpen;
  const stats = [
    { label: 'Specs closed', value: String(project.specsClosed) },
    { label: 'In progress', value: String(project.specsOpen) },
    { label: 'Blocked', value: String(project.blocked) },
    { label: 'Estimate accuracy', value: `${project.estAccuracy}%` },
  ];

  return (
    <section className={styles.detail} aria-label={`${project.name} detail`}>
      <header className={styles.detailHead}>
        <div className={styles.detailTitle}>
          <h3 className={styles.detailName}>{project.name}</h3>
          <SourceChip source={project.source} />
        </div>
        <span className={styles.healthPill} data-health={project.health}>
          <HealthDot health={project.health} />
          {HEALTH_META[project.health].label}
        </span>
      </header>

      <p className={styles.detailTakeaway}>{project.takeaway}</p>

      <div className={styles.strip}>
        {stats.map(stat => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <AreaChart
        points={project.pace}
        labels={PROJECT_TREND_WEEKS}
        tone={HEALTH_TONE[project.health]}
        unit="closed"
        caption="Specs closed per week"
      />

      <section className={styles.risk} aria-label="At-risk specs">
        <h4 className={styles.riskTitle}>
          At risk
          <span className={styles.riskCount}>{project.atRisk.length}</span>
        </h4>
        {project.atRisk.length > 0 ? (
          <ul className={styles.riskList}>
            {project.atRisk.map(item => (
              <li key={item.sourceKey} className={styles.riskRow}>
                <span className={styles.riskIcon}>
                  <WarningIcon size={14} weight="bold" />
                </span>
                <span className={styles.riskBody}>
                  <span className={styles.riskHead}>
                    <span className={styles.riskKey}>{item.sourceKey}</span>
                    <span className={styles.riskName}>{item.title}</span>
                  </span>
                  <span className={styles.riskReason}>{item.reason}</span>
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className={styles.riskButton}
                  icon={<ArrowRightIcon size={13} weight="bold" />}
                  aria-label={`Open ${item.sourceKey}`}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.riskEmpty}>
            Nothing flagged. {project.specsClosed} of {total} specs are closed
            and the rest are moving.
          </p>
        )}
      </section>
    </section>
  );
}
