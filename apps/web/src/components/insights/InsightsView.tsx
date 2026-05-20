import { useState } from 'react';

import {
  BuildingsIcon,
  ChartLineUpIcon,
  StackIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { Typography } from '@stride/ui';

import { MeScope } from './MeScope';
import { OrgScope } from './OrgScope';
import { ProjectsScope } from './ProjectsScope';
import { TeamScope } from './TeamScope';
import {
  ROLE_OPTIONS,
  ROLE_RANK,
  SCOPE_META,
  type InsightScope,
  type ScopeMeta,
  type WorkspaceRole,
} from './insights.mock';
import styles from './InsightsView.module.css';

const SCOPE_ICONS: Record<InsightScope, typeof ChartLineUpIcon> = {
  me: ChartLineUpIcon,
  projects: StackIcon,
  team: UsersThreeIcon,
  org: BuildingsIcon,
};

export function InsightsView() {
  const [role, setRole] = useState<WorkspaceRole>('workspace-admin');
  const [scope, setScope] = useState<InsightScope>('me');

  const visibleScopes = SCOPE_META.filter(meta => meta.minRoleRank <= ROLE_RANK[role]);
  const activeScope =
    visibleScopes.find(meta => meta.scope === scope) ?? visibleScopes[0]!;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Typography as="h1" size="2xl" weight="bold">
          Insights
        </Typography>
        <RoleSwitcher role={role} onRoleChange={setRole} />
      </header>

      <nav className={styles.scopeNav} aria-label="Insight scope">
        {visibleScopes.map(meta => (
          <ScopeMode
            key={meta.scope}
            meta={meta}
            active={meta.scope === activeScope.scope}
            onSelect={() => setScope(meta.scope)}
          />
        ))}
      </nav>

      {activeScope.scope === 'me' ? (
        <MeScope />
      ) : activeScope.scope === 'projects' ? (
        <ProjectsScope />
      ) : activeScope.scope === 'team' ? (
        <TeamScope role={role} />
      ) : (
        <OrgScope />
      )}
    </section>
  );
}

type RoleSwitcherProps = {
  role: WorkspaceRole;
  onRoleChange: (role: WorkspaceRole) => void;
};

function RoleSwitcher({ role, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className={styles.roleSwitcher}>
      <span className={styles.roleLabel}>Preview as</span>
      <div className={styles.roleOptions} role="group" aria-label="Preview as role">
        {ROLE_OPTIONS.map(option => {
          const isActive = option.role === role;
          return (
            <button
              key={option.role}
              type="button"
              className={isActive ? styles.roleButtonActive : styles.roleButton}
              aria-pressed={isActive}
              onClick={() => onRoleChange(option.role)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ScopeModeProps = {
  meta: ScopeMeta;
  active: boolean;
  onSelect: () => void;
};

function ScopeMode({ meta, active, onSelect }: ScopeModeProps) {
  const Icon = SCOPE_ICONS[meta.scope];

  return (
    <button
      type="button"
      className={active ? styles.scopeModeActive : styles.scopeMode}
      aria-pressed={active}
      onClick={onSelect}
    >
      <span className={styles.scopeIcon}>
        <Icon size={17} weight="bold" />
      </span>
      <span className={styles.scopeCopy}>
        <span className={styles.scopeTitle}>{meta.label}</span>
        <span className={styles.scopeSubtitle}>{meta.subtitle}</span>
      </span>
    </button>
  );
}

