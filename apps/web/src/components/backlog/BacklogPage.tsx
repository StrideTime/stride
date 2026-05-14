import { CheckCircle, GitBranch, Plus, Timer, Tray } from '@phosphor-icons/react';
import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';

import { Typography } from '@stride/ui';

import { backlogSpecs, type BacklogSpec } from './backlog.mock';
import styles from './BacklogPage.module.css';

const backlogViewLabels = {
  all: { title: 'All specs', description: 'Every synced spec in the current team scope.', empty: 'No work in this scope.' },
  refine: { title: 'Needs breakdown', description: 'Specs that still need action shape, estimates, or ownership.', empty: 'No specs need refinement.' },
  progress: { title: 'In progress', description: 'Work already moving across the team.', empty: 'No work in progress.' },
  blocked: { title: 'Blocked', description: 'Work waiting on someone else, source status, or approval.', empty: 'No blocked work in this scope.' },
  next: { title: 'Next up', description: 'Actions ready to schedule or start.', empty: 'No actions are ready.' },
  mine: { title: 'Assigned to me', description: 'Actions currently assigned to you.', empty: 'No assigned actions.' },
  completed: { title: 'Completed', description: 'Finished actions and specs.', empty: 'No completed work.' },
} as const;

type BacklogView = keyof typeof backlogViewLabels;

function getPriorityColorVar(spec: BacklogSpec) {
  if (spec.priority === 'P1') return 'var(--color-priority-p1-text)';
  if (spec.priority === 'P2') return 'var(--color-priority-p2-text)';
  if (spec.priority === 'P3') return 'var(--color-priority-p3-text)';
  return 'var(--color-priority-p4-text)';
}

type BacklogPageProps = {
  surface?: 'specs' | 'actions';
};

export function BacklogPage({ surface = 'specs' }: BacklogPageProps) {
  const [activeView, setActiveView] = useState<BacklogView>(surface === 'actions' ? 'next' : 'all');
  const visibleSpecs = getVisibleSpecs(activeView);
  const viewCopy = backlogViewLabels[activeView];

  return (
    <section className={styles.page}>
      <BacklogHeader surface={surface} />
      <BacklogControls surface={surface} activeView={activeView} onViewChange={setActiveView} />
      <div className={styles.pipeline}>
        <SpecGroup title={viewCopy.title} description={viewCopy.description} specs={visibleSpecs} emptyText={viewCopy.empty} />
      </div>
    </section>
  );
}

function getVisibleSpecs(view: BacklogView) {
  if (view === 'all') return backlogSpecs;
  if (view === 'refine') return backlogSpecs.filter(spec => spec.readiness !== 'ready');
  if (view === 'progress') return backlogSpecs.filter(spec => spec.actions.some(action => action.loggedMin > 0));
  if (view === 'next') return backlogSpecs.filter(spec => spec.readiness === 'ready' || spec.actions.length > 0);
  if (view === 'mine') return backlogSpecs.filter(spec => spec.assignee === 'You' || spec.actions.some(action => action.assignee === 'You'));
  if (view === 'completed') return backlogSpecs.filter(spec => spec.actions.length > 0 && spec.actions.every(action => action.done));
  return backlogSpecs.filter(spec =>
    spec.attention.includes('blocker-reported')
    || spec.attention.includes('closed-in-source')
    || spec.attention.includes('awaiting-approval'),
  );
}

type BacklogHeaderProps = {
  surface: 'specs' | 'actions';
};

function BacklogHeader({ surface }: BacklogHeaderProps) {
  return (
    <header className={styles.header}>
      <Typography as="h1" size="2xl" weight="bold">{surface === 'actions' ? 'Actions' : 'Specs'}</Typography>
    </header>
  );
}

type BacklogControlsProps = {
  surface: 'specs' | 'actions';
  activeView: BacklogView;
  onViewChange: (view: BacklogView) => void;
};

function BacklogControls({ surface, activeView, onViewChange }: BacklogControlsProps) {
  const modes = surface === 'actions'
    ? [
      { view: 'next' as const, title: 'Next up', subtitle: 'Ready now', icon: <CheckCircle size={18} weight="bold" /> },
      { view: 'progress' as const, title: 'In progress', subtitle: 'Active work', icon: <Timer size={18} weight="bold" /> },
      { view: 'blocked' as const, title: 'Blocked', subtitle: 'Needs help', icon: <GitBranch size={18} weight="bold" /> },
      { view: 'completed' as const, title: 'Completed', subtitle: 'Done work', icon: <CheckCircle size={18} weight="bold" /> },
    ]
    : [
      { view: 'all' as const, title: 'All specs', subtitle: 'Team scope', icon: <Tray size={18} weight="bold" /> },
      { view: 'refine' as const, title: 'Breakdown', subtitle: 'Needs shape', icon: <GitBranch size={18} weight="bold" /> },
      { view: 'progress' as const, title: 'In progress', subtitle: 'Active specs', icon: <Timer size={18} weight="bold" /> },
      { view: 'blocked' as const, title: 'Blocked', subtitle: 'Needs help', icon: <Timer size={18} weight="bold" /> },
    ];

  return (
    <div className={styles.navUseCases}>
      <div className={styles.modes}>
        {modes.map(mode => (
          <ModeButton key={mode.view} view={mode.view} activeView={activeView} onViewChange={onViewChange} title={mode.title} subtitle={mode.subtitle} icon={mode.icon} />
        ))}
      </div>
      <button className={styles.createButton}><Plus size={15} weight="bold" />Create</button>
    </div>
  );
}

type ModeButtonProps = {
  view: BacklogView;
  activeView: BacklogView;
  onViewChange: (view: BacklogView) => void;
  title: string;
  subtitle: string;
  icon?: ReactNode;
};

function ModeButton({ view, activeView, onViewChange, title, subtitle, icon }: ModeButtonProps) {
  const className = view === activeView ? `${styles.mode} ${styles.modeActive}` : styles.mode;

  return (
    <button className={className} onClick={() => onViewChange(view)}>
      {icon ? <span className={styles.modeIcon}>{icon}</span> : null}
      <span className={styles.modeCopy}>
        <span className={styles.modeTitle}>{title}</span>
        <span className={styles.modeSubtitle}>{subtitle}</span>
      </span>
    </button>
  );
}

type SpecGroupProps = {
  title: string;
  description: string;
  specs: BacklogSpec[];
  emptyText: string;
};

function SpecGroup({ title, description, specs, emptyText }: SpecGroupProps) {
  return (
    <section className={styles.group}>
      <div className={styles.groupHeader}>
        <div>
          <Typography as="h2" size="lg" weight="semibold">{title}</Typography>
          <Typography as="p" size="sm" color="muted">{description}</Typography>
        </div>
        <span className={styles.groupCount}>{specs.length}</span>
      </div>
      <div className={styles.specList}>
        {specs.length > 0
          ? specs.map(spec => <SpecRow key={spec.id} spec={spec} />)
          : <div className={styles.emptyState}>{emptyText}</div>}
      </div>
    </section>
  );
}

type SpecRowProps = {
  spec: BacklogSpec;
};

function SpecRow({ spec }: SpecRowProps) {
  const [isExpanded, setIsExpanded] = useState(spec.actions.length > 0 && spec.id === 'spec-2');

  return (
    <article
      className={styles.specRowShell}
      style={{ '--row-priority-color': getPriorityColorVar(spec) } as CSSProperties}
    >
      <button className={styles.specRow} onClick={() => setIsExpanded(open => !open)}>
        <span className={styles.expandIcon}>{isExpanded ? '⌄' : '›'}</span>
        <code className={styles.specKey}>{spec.sourceKey}</code>
        <div className={styles.specTitle}>{spec.title}</div>
        <span className={styles.priorityText}>{spec.sourcePriority}</span>
        <OwnerAvatar name={spec.assignee} />
        <span className={styles.specActionCount}>{spec.actions.length > 0 ? `${spec.actions.length} actions` : 'No actions'}</span>
      </button>
      {isExpanded ? (
        <div className={styles.actionTable}>
          {spec.actions.length > 0
            ? spec.actions.map(action => (
              <div key={action.id} className={styles.actionCompactRow}>
                <div className={styles.actionCompactCopy}>
                  <OwnerAvatar name={action.assignee ?? spec.assignee} />
                  <span className={styles.actionCompactTitle}>{action.title}</span>
                  <span className={styles.actionCompactMeta}>{spec.sourcePriority} · {action.done ? 'Done' : 'Open'}</span>
                </div>
                <span className={styles.actionSegmentedCtas}>
                  <button>Schedule</button>
                  {(action.assignee ?? spec.assignee) === 'You' ? <button>Start</button> : null}
                  <button>{action.assignee ?? spec.assignee ? 'Assign' : 'Claim'}</button>
                </span>
              </div>
            ))
            : <button className={styles.addActionButton}>Add first action</button>}
        </div>
      ) : null}
    </article>
  );
}

type OwnerAvatarProps = {
  name?: string;
};

function OwnerAvatar({ name }: OwnerAvatarProps) {
  return <span className={name ? styles.avatar : styles.avatarEmpty}>{name ? name.slice(0, 1) : '–'}</span>;
}


