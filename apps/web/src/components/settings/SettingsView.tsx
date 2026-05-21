import { useMemo, useState, type ElementType, type ReactNode } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';
import * as PhosphorIcons from '@phosphor-icons/react';
import {
  ArrowLeft,
  Bell,
  Briefcase,
  CalendarDots,
  CaretDown,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  Database,
  GearSix,
  GithubLogo,
  House,
  LinkSimple,
  MagnifyingGlass,
  PaintBrush,
  PlugsConnected,
  ShieldCheck,
  SlidersHorizontal,
  Smiley,
  SmileyMeh,
  SmileySad,
  Target,
  Trash,
  User,
  UsersThree,
} from '@phosphor-icons/react';
import { Badge, Button, Popover, Select, TextInput, Typography } from '@stride/ui';

import styles from './SettingsView.module.css';
import {
  captureRecords,
  checkInRecords,
  sessionRecords,
  type Feeling,
} from './yourData.mock';

export type SettingsSectionId =
  | 'my-workspace'
  | 'my-calendar'
  | 'my-notifications'
  | 'my-time-budgets'
  | 'my-event-types'
  | 'account'
  | 'appearance'
  | 'personal-connections'
  | 'your-data'
  | 'workspace-general'
  | 'workspace-connections'
  | 'workspace-members'
  | 'team-general'
  | 'team-members'
  | 'team-source';

type Role = 'member' | 'teamAdmin' | 'workspaceAdmin';

type WorkspaceOption = {
  id: string;
  name: string;
  plan: string;
  role: Role;
};

type TeamOption = {
  id: string;
  name: string;
  source: string;
  role: Role;
};

type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: typeof User;
};

type SettingsGroup = {
  id: string;
  label: string;
  helper: string;
  sections: SettingsSection[];
  minimumRole?: Role;
};

const workspaceOptions: WorkspaceOption[] = [
  { id: 'acme', name: 'Acme', plan: 'Organization', role: 'workspaceAdmin' },
  { id: 'orbit', name: 'Orbit', plan: 'Organization', role: 'teamAdmin' },
  { id: 'personal', name: 'Personal', plan: 'Personal', role: 'member' },
];

const teamsByWorkspace: Record<string, TeamOption[]> = {
  acme: [
    { id: 'platform', name: 'Platform', source: 'Acme Jira', role: 'teamAdmin' },
    { id: 'app', name: 'App', source: 'Linear Engineering', role: 'member' },
    { id: 'infra', name: 'Infrastructure', source: 'GitHub Org', role: 'workspaceAdmin' },
  ],
  orbit: [
    { id: 'product', name: 'Product', source: 'Linear Product', role: 'teamAdmin' },
    { id: 'design', name: 'Design', source: 'Not mapped', role: 'member' },
  ],
  personal: [
    { id: 'personal', name: 'Personal', source: 'No source', role: 'member' },
  ],
};

const ROLE_RANK: Record<Role, number> = {
  member: 1,
  teamAdmin: 2,
  workspaceAdmin: 3,
};

const groups: SettingsGroup[] = [
  {
    id: 'my-settings',
    label: 'My workspace settings',
    helper: 'Your defaults for Acme Platform.',
    sections: [
      {
        id: 'my-workspace',
        label: 'Overview',
        description: 'Working hours, tracking, and workspace-specific preferences.',
        icon: SlidersHorizontal,
      },
      {
        id: 'my-calendar',
        label: 'Calendar',
        description: 'Opt into calendar sync for this workspace.',
        icon: CalendarDots,
      },
      {
        id: 'my-notifications',
        label: 'Notifications',
        description: 'Overrides for nudges and summaries in this workspace.',
        icon: Bell,
      },
      {
        id: 'my-time-budgets',
        label: 'Time budgets',
        description: 'Daily and weekly budget targets.',
        icon: Clock,
      },
      {
        id: 'my-event-types',
        label: 'Event types',
        description: 'Custom schedule types for this workspace.',
        icon: CalendarDots,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    helper: 'Account-wide settings across every workspace.',
    sections: [
      {
        id: 'account',
        label: 'Account',
        description: 'Identity, email, password, and devices.',
        icon: User,
      },
      {
        id: 'appearance',
        label: 'Appearance',
        description: 'Theme and interface preferences.',
        icon: PaintBrush,
      },
      {
        id: 'personal-connections',
        label: 'Personal connections',
        description: 'Calendar accounts you can opt into per workspace.',
        icon: LinkSimple,
      },
      {
        id: 'your-data',
        label: 'Your data',
        description: 'See, export, and delete everything Stride has captured about you.',
        icon: Database,
      },
    ],
  },
  {
    id: 'workspace-admin',
    label: 'Workspace admin',
    helper: 'Visible to workspace admins only.',
    minimumRole: 'workspaceAdmin',
    sections: [
      {
        id: 'workspace-general',
        label: 'General',
        description: 'Workspace name, roles, defaults, and policies.',
        icon: Briefcase,
      },
      {
        id: 'workspace-connections',
        label: 'Source connections',
        description: 'Workspace pool of Jira, Linear, and GitHub connections.',
        icon: PlugsConnected,
      },
      {
        id: 'workspace-members',
        label: 'Members',
        description: 'Invites, workspace roles, and membership state.',
        icon: UsersThree,
      },
    ],
  },
  {
    id: 'team-admin',
    label: 'Team admin',
    helper: 'For the selected team inside this workspace.',
    minimumRole: 'teamAdmin',
    sections: [
      {
        id: 'team-general',
        label: 'Team defaults',
        description: 'Default working hours and onboarding seeds for new members.',
        icon: GearSix,
      },
      {
        id: 'team-members',
        label: 'Members',
        description: 'Invite people to the selected team or add workspace members.',
        icon: UsersThree,
      },
      {
        id: 'team-source',
        label: 'Source mapping',
        description: 'Choose one unclaimed external team, board, or repo.',
        icon: ShieldCheck,
      },
    ],
  },
];

const allSections = groups.flatMap(group => group.sections);

function canAccess(group: SettingsGroup, workspaceRole: Role, teamRole: Role) {
  if (!group.minimumRole) return true;

  const effectiveRole = group.minimumRole === 'teamAdmin' ? teamRole : workspaceRole;

  return ROLE_RANK[effectiveRole] >= ROLE_RANK[group.minimumRole];
}

function roleLabel(role: Role) {
  if (role === 'workspaceAdmin') return 'Workspace admin';
  if (role === 'teamAdmin') return 'Team admin';

  return 'Member';
}

type SettingsViewProps = {
  section: SettingsSectionId;
};

export function SettingsView({ section }: SettingsViewProps) {
  const navigate = useNavigate();
  const [workspaceId, setWorkspaceId] = useState('acme');
  const [teamId, setTeamId] = useState('platform');
  const currentWorkspace = workspaceOptions.find(workspace => workspace.id === workspaceId) ?? workspaceOptions[0]!;
  const teamOptions = teamsByWorkspace[currentWorkspace.id] ?? [];
  const currentTeam = teamOptions.find(team => team.id === teamId) ?? teamOptions[0]!;
  const visibleGroups = groups.filter(group => canAccess(group, currentWorkspace.role, currentTeam.role));
  const activeSection = allSections.find(item => item.id === section) ?? allSections[0]!;

  const selectWorkspace = (nextWorkspaceId: string) => {
    const nextTeams = teamsByWorkspace[nextWorkspaceId] ?? [];

    setWorkspaceId(nextWorkspaceId);
    setTeamId(nextTeams[0]?.id ?? '');
  };

  const setSection = (nextSection: SettingsSectionId) => {
    navigate({
      to: '/settings',
      search: { section: nextSection },
    });
  };

  return (
    <section className={styles.page}>
      <aside className={styles.sidebar} aria-label="Settings sections">
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.backLink} aria-label="Back to app">
            <ArrowLeft size={15} weight="bold" aria-hidden="true" />
          </Link>
          <Typography as="h1" size="lg" weight="bold" className={styles.title}>
            Settings
          </Typography>
        </div>

        <div className={styles.scopePanel}>
          <CompactPicker
            label="Workspace"
            value={currentWorkspace.name}
            meta={roleLabel(currentWorkspace.role)}
            options={workspaceOptions.map(workspace => ({
              value: workspace.id,
              label: workspace.name,
              meta: roleLabel(workspace.role),
            }))}
            onSelect={selectWorkspace}
          />

          <CompactPicker
            label="Team"
            value={currentTeam.name}
            meta={roleLabel(currentTeam.role)}
            options={teamOptions.map(team => ({
              value: team.id,
              label: team.name,
              meta: `${team.source} · ${roleLabel(team.role)}`,
            }))}
            onSelect={setTeamId}
          />
        </div>

        <nav className={styles.nav}>
          {visibleGroups.map(group => (
            <div className={styles.navGroup} key={group.id}>
              <Typography as="p" size="xs" weight="semibold" color="muted" className={styles.groupLabel}>
                {group.label}
              </Typography>
              <div className={styles.navItems}>
                {group.sections.map(item => {
                  const Icon = item.icon;
                  const isActive = activeSection.id === item.id;

                  return (
                    <button
                      className={isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      type="button"
                    >
                      <Icon aria-hidden="true" size={16} weight={isActive ? 'fill' : 'regular'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className={styles.content}>
        <div className={styles.mobileBackstop}>
          <Link to="/" className={styles.backLink}>
            <House size={15} weight="bold" aria-hidden="true" />
            <span>App home</span>
          </Link>
        </div>
        <header className={styles.contentHeader}>
          <Typography as="h2" size="2xl" weight="bold">
            {activeSection.label}
          </Typography>
          <Typography as="p" size="base" color="muted" className={styles.description}>
            {activeSection.description}
          </Typography>
        </header>

        <SectionContent section={activeSection.id} />
      </main>
    </section>
  );
}

type SectionContentProps = {
  section: SettingsSectionId;
};

function SectionContent({ section }: SectionContentProps) {
  switch (section) {
    case 'my-workspace':
      return <MyWorkspaceSection />;
    case 'my-calendar':
      return <CalendarSection />;
    case 'my-notifications':
      return <NotificationsSection />;
    case 'my-time-budgets':
      return <TimeBudgetsSection />;
    case 'my-event-types':
      return <EventTypesSection />;
    case 'account':
      return <AccountSection />;
    case 'appearance':
      return <AppearanceSection />;
    case 'personal-connections':
      return <PersonalConnectionsSection />;
    case 'your-data':
      return <YourDataSection />;
    case 'workspace-general':
      return <WorkspaceGeneralSection />;
    case 'workspace-connections':
      return <WorkspaceConnectionsSection />;
    case 'workspace-members':
      return <WorkspaceMembersSection />;
    case 'team-general':
      return <TeamDefaultsSection />;
    case 'team-members':
      return <TeamMembersSection />;
    case 'team-source':
      return <TeamSourceSection />;
  }
}

function MyWorkspaceSection() {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [trackingMode, setTrackingMode] = useState('sessions');
  const [timezone, setTimezone] = useState('America/Denver');

  return (
    <div className={styles.stack}>
      <div className={styles.formPanel}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">Working hours</Typography>
          <Typography as="p" size="sm" color="muted">
            Used for schedule capacity in this workspace.
          </Typography>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <Typography as="label" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>
              Start
            </Typography>
            <TextInput type="time" value={startTime} onChange={event => setStartTime(event.target.value)} />
          </div>
          <div className={styles.fieldGroup}>
            <Typography as="label" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>
              End
            </Typography>
            <TextInput type="time" value={endTime} onChange={event => setEndTime(event.target.value)} />
          </div>
          <Select
            label="Timezone"
            value={timezone}
            onChange={setTimezone}
            options={[
              { value: 'America/Denver', label: 'Mountain time' },
              { value: 'America/Los_Angeles', label: 'Pacific time' },
              { value: 'America/New_York', label: 'Eastern time' },
            ]}
          />
        </div>
      </div>

      <ChoicePanel
        title="Time tracking source"
        value={trackingMode}
        onChange={setTrackingMode}
        options={[
          ['schedule', 'Schedule-based', 'Past scheduled action blocks count as worked time until adjusted.'],
          ['sessions', 'Session-based', 'Actual time comes from explicit start and stop sessions.'],
        ]}
      />

      <div className={styles.actionRow}>
        <Button variant="secondary">Reset to team defaults</Button>
        <Button variant="primary">Save changes</Button>
      </div>
    </div>
  );
}

function EventTypesSection() {
  return (
    <div className={styles.stack}>
      <section className={styles.formPanel}>
        <div className={styles.sectionToolbarInline}>
          <Typography as="h3" size="lg" weight="semibold">Event types</Typography>
          <Button variant="secondary" size="sm">Add type</Button>
        </div>
        <div className={styles.typeEditorList}>
          <EventTypeRow name="Actions" tone="accent" />
          <EventTypeRow name="Meetings" tone="warning" />
          <EventTypeRow name="Research" tone="cyan" />
          <EventTypeRow name="Focus" tone="success" />
          <EventTypeRow name="Buffers" tone="slate" />
        </div>
      </section>
      <SaveRow />
    </div>
  );
}

function TimeBudgetsSection() {
  const [budgetSpan, setBudgetSpan] = useState('week');
  const [budgetGoal, setBudgetGoal] = useState('aim');
  const [allocationMode, setAllocationMode] = useState('percent');

  return (
    <div className={styles.stack}>
      <section className={styles.formPanel}>
        <div className={styles.sectionToolbarInline}>
          <Typography as="h3" size="lg" weight="semibold">Time budgets</Typography>
          <Button variant="secondary" size="sm">New budget</Button>
        </div>
        <div className={styles.budgetTabs}>
          <button className={styles.budgetTabActive} type="button">Work week <Badge variant="success">Active</Badge></button>
          <button type="button">Launch week</button>
          <button type="button">Light week</button>
        </div>
        <div className={styles.budgetEditor}>
          <div className={styles.formGrid}>
            <Select label="Span" value={budgetSpan} onChange={setBudgetSpan} options={[{ value: 'day', label: 'Daily' }, { value: 'week', label: 'Weekly' }]} />
            <Select label="Goal" value={budgetGoal} onChange={setBudgetGoal} options={[{ value: 'max', label: 'No more than' }, { value: 'min', label: 'At least' }, { value: 'aim', label: 'Aim for' }]} />
            <Select label="Allocation" value={allocationMode} onChange={setAllocationMode} options={[{ value: 'percent', label: 'Percent of total' }, { value: 'duration', label: 'Duration by type' }]} />
          </div>
          {allocationMode === 'percent' ? (
            <div className={styles.budgetAllocationHeader}>
              <div className={styles.fieldGroup}>
                <Typography as="label" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>Total hours</Typography>
                <TextInput type="number" defaultValue="40" min="0" />
              </div>
            </div>
          ) : null}
          <BudgetRow name="Actions" value={allocationMode === 'percent' ? '55' : '22'} unit={allocationMode === 'percent' ? '%' : 'h'} tone="accent" />
          <BudgetRow name="Meetings" value={allocationMode === 'percent' ? '20' : '8'} unit={allocationMode === 'percent' ? '%' : 'h'} tone="warning" />
          <BudgetRow name="Research" value={allocationMode === 'percent' ? '20' : '8'} unit={allocationMode === 'percent' ? '%' : 'h'} tone="cyan" />
          <BudgetRow name="Focus" value={allocationMode === 'percent' ? '15' : '6'} unit={allocationMode === 'percent' ? '%' : 'h'} tone="success" />
        </div>
      </section>
      <SaveRow />
    </div>
  );
}

function NotificationsSection() {
  const [mode, setMode] = useState('minimal');
  const [summaryTime, setSummaryTime] = useState('17:00');

  return (
    <div className={styles.stack}>
      <ChoicePanel
        title="Workspace nudges"
        value={mode}
        onChange={setMode}
        options={[
          ['silent', 'Silent', 'No workspace nudges.'],
          ['minimal', 'Minimal', 'Recommended check-ins only.'],
          ['active', 'Active', 'More frequent planning and session prompts.'],
        ]}
      />
      <div className={styles.formPanel}>
        <div className={styles.formGridTwo}>
          <Select
            label="Daily summary"
            value={summaryTime}
            onChange={setSummaryTime}
            options={[
              { value: '16:00', label: '4:00 PM' },
              { value: '17:00', label: '5:00 PM' },
              { value: '18:00', label: '6:00 PM' },
            ]}
          />
          <ToggleRow title="Meeting prompts" detail="Show tray prompts before calendar meetings." defaultOn />
        </div>
      </div>
      <SaveRow />
    </div>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState('dark');
  const [density, setDensity] = useState('default');

  return (
    <div className={styles.stack}>
      <ChoicePanel
        title="Theme"
        value={theme}
        onChange={setTheme}
        options={[
          ['dark', 'Dark', 'Current default for Stride.'],
          ['light', 'Light', 'Use the light token set.'],
          ['system', 'System', 'Follow OS preference.'],
        ]}
      />
      <ChoicePanel
        title="Density"
        value={density}
        onChange={setDensity}
        options={[
          ['default', 'Default', 'Balanced for planning and scanning.'],
          ['compact', 'Compact', 'Tighter lists and lower row height.'],
        ]}
      />
      <SaveRow />
    </div>
  );
}

function PersonalConnectionsSection() {
  return (
    <div className={styles.stack}>
      <ConnectionRow name="Google Calendar" detail="alex@acme.test · available to opt into per workspace" status="Connected" />
      <ConnectionRow name="Google Calendar" detail="Connect another calendar account" status="Available" />
      <div className={styles.actionRow}><Button variant="primary">Connect calendar</Button></div>
    </div>
  );
}

const PAGE_SIZE = 12;

type DataCategory = 'sessions' | 'checkins' | 'captures';

const DATA_CATEGORIES: readonly DataCategory[] = ['sessions', 'checkins', 'captures'];

const CATEGORY_LABEL: Record<DataCategory, string> = {
  sessions: 'Sessions',
  checkins: 'Check-ins',
  captures: 'Captures',
};

const FEELING_META: Record<Feeling, { label: string; icon: typeof Smiley }> = {
  frown: { label: 'Tough', icon: SmileySad },
  neutral: { label: 'Okay', icon: SmileyMeh },
  smile: { label: 'Good', icon: Smiley },
  target: { label: 'On point', icon: Target },
};

const whenFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});
const sinceFormat = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

function formatWhen(iso: string) {
  return whenFormat.format(new Date(iso));
}

function formatDuration(min: number) {
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function GuaranteeNote({ body }: { body: string }) {
  return (
    <div className={styles.guaranteeNote}>
      <ShieldCheck size={17} weight="fill" aria-hidden="true" />
      <Typography as="p" size="sm" color="muted">{body}</Typography>
    </div>
  );
}

function FeelingTag({ feeling }: { feeling: Feeling | null }) {
  if (!feeling) {
    return <Typography as="span" size="xs" color="muted">Not logged</Typography>;
  }
  const meta = FEELING_META[feeling];
  const Icon = meta.icon;
  return (
    <span className={styles.feelingTag}>
      <Icon size={15} weight="fill" aria-hidden="true" />
      <Typography as="span" size="xs" weight="semibold">{meta.label}</Typography>
    </span>
  );
}

type DataTableRow = {
  id: string;
  cells: ReactNode[];
  confirmText: string;
  deleteLabel: string;
};

type DataTableProps = {
  columns: string[];
  gridClass: string;
  rows: DataTableRow[];
  confirmId: string | null;
  onConfirm: (id: string | null) => void;
  onDelete: (id: string) => void;
  emptyTitle: string;
  emptyBody: string;
};

function DataTable({
  columns,
  gridClass,
  rows,
  confirmId,
  onConfirm,
  onDelete,
  emptyTitle,
  emptyBody,
}: DataTableProps) {
  if (rows.length === 0) {
    return (
      <div className={styles.dataEmpty}>
        <Typography as="p" size="sm" weight="semibold">{emptyTitle}</Typography>
        <Typography as="p" size="sm" color="muted">{emptyBody}</Typography>
      </div>
    );
  }

  const gridClassName = [styles.dataGrid, styles[gridClass]].filter(Boolean).join(' ');

  return (
    <div className={styles.dataTable} role="table">
      <div className={`${styles.dataHead} ${gridClassName}`} role="row">
        {columns.map(column => (
          <Typography
            as="span"
            key={column}
            size="xs"
            weight="semibold"
            color="muted"
            className={styles.fieldLabel}
          >
            {column}
          </Typography>
        ))}
        <span aria-hidden="true" />
      </div>
      {rows.map(row => (
        confirmId === row.id ? (
          <div className={styles.dataConfirm} key={row.id} role="row">
            <Typography as="p" size="sm">{row.confirmText}</Typography>
            <div className={styles.confirmActions}>
              <Button size="sm" variant="ghost" onClick={() => onConfirm(null)}>Cancel</Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  onDelete(row.id);
                  onConfirm(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className={`${styles.dataRow} ${gridClassName}`} key={row.id} role="row">
            {row.cells.map((cell, index) => (
              <div className={styles.dataCell} key={columns[index] ?? String(index)} role="cell">
                {cell}
              </div>
            ))}
            <button
              aria-label={row.deleteLabel}
              className={styles.rowDelete}
              onClick={() => onConfirm(row.id)}
              type="button"
            >
              <Trash size={15} aria-hidden="true" />
            </button>
          </div>
        )
      ))}
    </div>
  );
}

function YourDataSection() {
  const [sessions, setSessions] = useState(sessionRecords);
  const [checkins, setCheckins] = useState(checkInRecords);
  const [captures, setCaptures] = useState(captureRecords);
  const [category, setCategory] = useState<DataCategory>('sessions');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [dangerConfirm, setDangerConfirm] = useState<DataCategory | null>(null);
  const [exportState, setExportState] = useState<'idle' | 'working' | 'done'>('idle');

  const counts: Record<DataCategory, number> = {
    sessions: sessions.length,
    checkins: checkins.length,
    captures: captures.length,
  };
  const totalCount = counts.sessions + counts.checkins + counts.captures;

  const earliest = useMemo(() => {
    const stamps = [
      ...sessions.map(record => record.at),
      ...checkins.map(record => record.at),
      ...captures.map(record => record.at),
    ];
    if (stamps.length === 0) return null;
    return stamps.reduce((min, at) => (at < min ? at : min));
  }, [sessions, checkins, captures]);

  const normalizedQuery = query.trim().toLowerCase();

  const allRows = useMemo<DataTableRow[]>(() => {
    if (category === 'sessions') {
      return sessions
        .filter(record => normalizedQuery === ''
          || record.actionTitle.toLowerCase().includes(normalizedQuery)
          || (record.specKey?.toLowerCase().includes(normalizedQuery) ?? false))
        .map(record => ({
          id: record.id,
          deleteLabel: `Delete session on ${record.actionTitle}`,
          confirmText: 'Delete this session? Its logged time and check-in are removed with it.',
          cells: [
            <Typography key="when" as="span" size="sm" color="muted">{formatWhen(record.at)}</Typography>,
            <span key="action" className={styles.titleCell}>
              <Typography as="span" size="sm" weight="semibold" className={styles.truncate}>
                {record.actionTitle}
              </Typography>
              {record.specKey
                ? <span className={styles.specKey}>{record.specKey}</span>
                : <Typography as="span" size="xs" color="muted">Personal</Typography>}
            </span>,
            <Typography key="duration" as="span" size="sm">{formatDuration(record.durationMin)}</Typography>,
            <FeelingTag key="felt" feeling={record.feeling} />,
          ],
        }));
    }
    if (category === 'checkins') {
      return checkins
        .filter(record => normalizedQuery === ''
          || record.note.toLowerCase().includes(normalizedQuery)
          || record.onAction.toLowerCase().includes(normalizedQuery))
        .map(record => ({
          id: record.id,
          deleteLabel: `Delete check-in from ${formatWhen(record.at)}`,
          confirmText: 'Delete this check-in? The session it belongs to stays.',
          cells: [
            <Typography key="when" as="span" size="sm" color="muted">{formatWhen(record.at)}</Typography>,
            <FeelingTag key="felt" feeling={record.feeling} />,
            <span key="note" className={styles.noteCell}>
              <Typography as="span" size="sm" className={styles.truncate}>
                {record.note === '' ? 'No note left' : record.note}
              </Typography>
              <Typography as="span" size="xs" color="muted" className={styles.truncate}>
                {`on ${record.onAction}`}
              </Typography>
            </span>,
          ],
        }));
    }
    return captures
      .filter(record => normalizedQuery === ''
        || record.text.toLowerCase().includes(normalizedQuery)
        || record.kind.toLowerCase().includes(normalizedQuery))
      .map(record => ({
        id: record.id,
        deleteLabel: `Delete capture from ${formatWhen(record.at)}`,
        confirmText: 'Delete this capture?',
        cells: [
          <Typography key="when" as="span" size="sm" color="muted">{formatWhen(record.at)}</Typography>,
          <Badge key="kind" variant={record.kind === 'Insight' ? 'accent' : 'neutral'}>{record.kind}</Badge>,
          <Typography key="text" as="span" size="sm" className={styles.truncate}>{record.text}</Typography>,
        ],
      }));
  }, [category, sessions, checkins, captures, normalizedQuery]);

  const pageCount = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleRows = allRows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = allRows.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visibleRows.length;

  const selectCategory = (next: DataCategory) => {
    setCategory(next);
    setQuery('');
    setPage(0);
    setConfirmId(null);
  };

  const updateQuery = (next: string) => {
    setQuery(next);
    setPage(0);
    setConfirmId(null);
  };

  const deleteRow = (id: string) => {
    if (category === 'sessions') setSessions(rows => rows.filter(record => record.id !== id));
    else if (category === 'checkins') setCheckins(rows => rows.filter(record => record.id !== id));
    else setCaptures(rows => rows.filter(record => record.id !== id));
  };

  const deleteAll = (target: DataCategory) => {
    if (target === 'sessions') setSessions([]);
    else if (target === 'checkins') setCheckins([]);
    else setCaptures([]);
    setDangerConfirm(null);
    if (target === category) {
      setPage(0);
      setConfirmId(null);
    }
  };

  const exportData = () => {
    if (exportState === 'working') return;
    setExportState('working');
    window.setTimeout(() => {
      const payload = JSON.stringify({ sessions, checkins, captures }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'stride-your-data.json';
      link.click();
      URL.revokeObjectURL(url);
      setExportState('done');
    }, 850);
  };

  const columnsByCategory: Record<DataCategory, string[]> = {
    sessions: ['When', 'Action', 'Duration', 'Felt'],
    checkins: ['When', 'Felt', 'Note'],
    captures: ['When', 'Kind', 'Note'],
  };
  const emptyByCategory: Record<DataCategory, [string, string]> = {
    sessions: ['No sessions recorded', 'When you run a timed session it lands here, fully under your control.'],
    checkins: ['No check-ins recorded', 'A check-in is the quick how-did-it-go you log when a session ends.'],
    captures: ['No captures recorded', 'Captures are quick notes you take during a session with the capture shortcut.'],
  };
  const gridByCategory: Record<DataCategory, string> = {
    sessions: 'gridSessions',
    checkins: 'gridCheckins',
    captures: 'gridCaptures',
  };
  const filteredEmpty = normalizedQuery !== '' && allRows.length === 0;

  return (
    <div className={styles.stack}>
      <div className={styles.formPanel}>
        <div className={styles.dataIntro}>
          <Database size={22} weight="fill" aria-hidden="true" className={styles.dataIntroIcon} />
          <div className={styles.panelHeader}>
            <Typography as="h3" size="lg" weight="semibold">Everything Stride has captured</Typography>
            <Typography as="p" size="sm" color="muted">
              Your sessions, check-ins, and captures all live here. Read them, export them,
              or delete any of them whenever you want. A delete is permanent and drops the
              data from every Stride report at once.
            </Typography>
          </div>
        </div>
        <GuaranteeNote body="In team reports, individual session detail is never shown to anyone. That is built into how Stride works, not a setting you have to trust." />
      </div>

      <div className={styles.dataTabs}>
        {DATA_CATEGORIES.map(value => (
          <button
            aria-pressed={value === category}
            className={value === category ? `${styles.dataTab} ${styles.dataTabActive}` : styles.dataTab}
            key={value}
            onClick={() => selectCategory(value)}
            type="button"
          >
            {CATEGORY_LABEL[value]}
            <span className={styles.dataTabCount}>{counts[value]}</span>
          </button>
        ))}
      </div>

      <div className={styles.dataToolbar}>
        <Typography as="p" size="xs" color="muted">
          {totalCount === 0
            ? 'No records yet.'
            : `${counts.sessions} sessions · ${counts.checkins} check-ins · ${counts.captures} captures${earliest ? ` · since ${sinceFormat.format(new Date(earliest))}` : ''}`}
        </Typography>
        <label className={styles.dataSearch}>
          <MagnifyingGlass size={15} aria-hidden="true" />
          <input
            aria-label={`Search ${CATEGORY_LABEL[category].toLowerCase()}`}
            onChange={event => updateQuery(event.target.value)}
            placeholder={`Search ${CATEGORY_LABEL[category].toLowerCase()}`}
            value={query}
          />
        </label>
      </div>

      <DataTable
        columns={columnsByCategory[category]}
        gridClass={gridByCategory[category]}
        rows={visibleRows}
        confirmId={confirmId}
        onConfirm={setConfirmId}
        onDelete={deleteRow}
        emptyTitle={filteredEmpty ? `Nothing matches “${query.trim()}”` : emptyByCategory[category][0]}
        emptyBody={filteredEmpty ? 'Try a different search.' : emptyByCategory[category][1]}
      />

      {allRows.length > 0 ? (
        <div className={styles.dataFooter}>
          <Typography as="span" size="xs" color="muted">
            {`Showing ${rangeStart}–${rangeEnd} of ${allRows.length}`}
          </Typography>
          {pageCount > 1 ? (
            <div className={styles.pager}>
              <button
                aria-label="Previous page"
                className={styles.pagerButton}
                disabled={safePage === 0}
                onClick={() => setPage(value => Math.max(0, value - 1))}
                type="button"
              >
                <CaretLeft size={14} aria-hidden="true" />
              </button>
              <Typography as="span" size="xs" color="muted">{`${safePage + 1} / ${pageCount}`}</Typography>
              <button
                aria-label="Next page"
                className={styles.pagerButton}
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(value => Math.min(pageCount - 1, value + 1))}
                type="button"
              >
                <CaretRight size={14} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.formPanel}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">Export your data</Typography>
          <Typography as="p" size="sm" color="muted">
            Download every session, check-in, and capture as one JSON file.
          </Typography>
        </div>
        <div className={styles.exportRow}>
          <Button variant="secondary" onClick={exportData} disabled={exportState === 'working'}>
            {exportState === 'working'
              ? 'Preparing…'
              : exportState === 'done'
                ? 'Export again'
                : 'Export everything (JSON)'}
          </Button>
          {exportState === 'done' ? (
            <span className={styles.exportDone}>
              <CheckCircle size={16} weight="fill" aria-hidden="true" />
              <Typography as="span" size="sm" color="muted">Downloaded as stride-your-data.json</Typography>
            </span>
          ) : null}
        </div>
      </div>

      <div className={`${styles.formPanel} ${styles.dangerPanel}`}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">Delete data</Typography>
          <Typography as="p" size="sm" color="muted">
            Remove a whole category at once. This cannot be undone.
          </Typography>
        </div>
        <div className={styles.dangerList}>
          {DATA_CATEGORIES.map(value => (
            <div className={styles.dangerRow} key={value}>
              {dangerConfirm === value ? (
                <>
                  <Typography as="span" size="sm">
                    {`Delete all ${counts[value]} ${CATEGORY_LABEL[value].toLowerCase()}? This is permanent.`}
                  </Typography>
                  <div className={styles.confirmActions}>
                    <Button size="sm" variant="ghost" onClick={() => setDangerConfirm(null)}>Cancel</Button>
                    <Button size="sm" variant="danger" onClick={() => deleteAll(value)}>Delete all</Button>
                  </div>
                </>
              ) : (
                <>
                  <span className={styles.dangerLabel}>
                    <Typography as="span" size="sm" weight="semibold">{CATEGORY_LABEL[value]}</Typography>
                    <Typography as="span" size="xs" color="muted">
                      {`${counts[value]} record${counts[value] === 1 ? '' : 's'}`}
                    </Typography>
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={counts[value] === 0}
                    onClick={() => setDangerConfirm(value)}
                  >
                    Delete all
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkspaceGeneralSection() {
  return (
    <div className={styles.stack}>
      <div className={styles.formPanel}>
        <div className={styles.formGridTwo}>
          <div className={styles.fieldGroup}>
            <Typography as="label" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>Name</Typography>
            <TextInput defaultValue="Acme" />
          </div>
          <Select
            label="Default role"
            value="member"
            onChange={() => undefined}
            options={[{ value: 'member', label: 'Member' }, { value: 'teamAdmin', label: 'Team admin' }]}
          />
        </div>
      </div>
      <div className={styles.formPanel}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">Aggregate insights only</Typography>
        </div>
        <GuaranteeNote body="Workspace and team reports only ever show aggregate patterns. Individual session detail is never exposed to admins or teammates. Stride enforces this; it is not a setting that can be turned off." />
      </div>
      <SaveRow />
    </div>
  );
}

function WorkspaceMembersSection() {
  return (
    <div className={styles.stack}>
      <div className={styles.compactToolbar}>
        <TextInput placeholder="teammate@company.com" />
        <Button variant="primary">Invite</Button>
      </div>
      <div className={styles.compactList}>
        <MemberRow name="Jaren Lee" email="jaren@acme.test" detail="Workspace admin" />
        <MemberRow name="Morgan Chen" email="morgan@acme.test" detail="Team admin · Platform" />
        <MemberRow name="Sam Patel" email="sam@acme.test" detail="Member · App" />
        <MemberRow name="Nora Kim" email="nora@acme.test" detail="Member · Infrastructure" />
      </div>
    </div>
  );
}

function TeamMembersSection() {
  return (
    <div className={styles.stack}>
      <div className={styles.sectionToolbar}>
        <div>
          <Typography as="h3" size="lg" weight="semibold">Platform members</Typography>
          <Typography as="p" size="sm" color="muted">3 members</Typography>
        </div>
        <Popover
          side="bottom"
          align="end"
          trigger={<span>Add member</span>}
          triggerClassName={styles.addMemberTrigger}
          popupClassName={styles.inviteMenu}
        >
          <button className={styles.inviteMenuItem} type="button">
            <Typography as="span" size="sm" weight="semibold">Add from workspace</Typography>
            <Typography as="span" size="xs" color="muted">Choose someone already in Acme.</Typography>
          </button>
          <button className={styles.inviteMenuItem} type="button">
            <Typography as="span" size="sm" weight="semibold">Invite by email</Typography>
            <Typography as="span" size="xs" color="muted">Invite someone new to Acme and Platform.</Typography>
          </button>
        </Popover>
      </div>
      <div className={styles.compactList}>
        <MemberRow name="Jaren Lee" email="jaren@acme.test" detail="Team admin" />
        <MemberRow name="Morgan Chen" email="morgan@acme.test" detail="Team admin" />
        <MemberRow name="Priya Shah" email="priya@acme.test" detail="Member" />
      </div>
    </div>
  );
}

function CalendarSection() {
  const [calendar, setCalendar] = useState('work');

  return (
    <div className={styles.stack}>
      <div className={styles.formPanel}>
        <div className={styles.formGridTwo}>
          <Select
            label="Calendar"
            value={calendar}
            onChange={setCalendar}
            options={[{ value: 'work', label: 'Work Calendar' }, { value: 'personal', label: 'Personal Calendar' }, { value: 'none', label: 'Do not sync' }]}
          />
          <ToggleRow title="Use busy events" detail="Busy events reduce available capacity." defaultOn />
        </div>
      </div>
      <div className={styles.formPanel}>
        <ToggleRow title="Meeting prompts" detail="Show tray prompt before meetings." defaultOn />
        <ToggleRow title="Show free events" detail="Keep free events visible on Schedule." />
      </div>
      <SaveRow />
    </div>
  );
}

function WorkspaceConnectionsSection() {
  return (
    <div className={styles.stack}>
      <div className={styles.integrationGrid}>
        <IntegrationCard name="Acme Jira" detail="4 boards mapped · 1 unmapped" status="Connected" logo="J" />
        <IntegrationCard name="Linear Engineering" detail="2 teams mapped · 2 unmapped" status="Available" logo="L" />
        <IntegrationCard name="GitHub Org" detail="No repositories mapped" status="Available" logo={<GithubLogo size={22} weight="fill" />} />
      </div>
      <div className={styles.actionRow}><Button variant="primary">Add source connection</Button></div>
    </div>
  );
}

function TeamSourceSection() {
  const [source, setSource] = useState<'jira' | 'linear' | 'github'>('jira');
  const [entity, setEntity] = useState('platform');
  const [cycleLabel, setCycleLabel] = useState('Sprint');
  const selectedEntity = entity === 'mobile'
    ? { name: 'Mobile', type: 'Kanban board', cadence: 'Continuous flow' }
    : { name: 'Platform', type: 'Scrum board', cadence: '2 week sprint' };

  return (
    <div className={styles.stack}>
      <div className={styles.mappingHeader}>
        <Typography as="h3" size="lg" weight="semibold">Source mapping</Typography>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.mappingControlsBetter}>
          <PickerCard
            label="Source"
            value={source === 'jira' ? 'Stride' : source === 'linear' ? 'Product' : 'StrideTime'}
            mark={source === 'github' ? <GithubLogo size={18} weight="fill" /> : source === 'linear' ? 'L' : 'J'}
            options={[
              { value: 'jira', label: 'Stride', meta: 'Jira · 2 teams available', mark: 'J' },
              { value: 'linear', label: 'Product', meta: 'Linear · 1 team available', mark: 'L' },
              { value: 'github', label: 'StrideTime', meta: 'GitHub · all teams claimed', mark: <GithubLogo size={16} weight="fill" /> },
              { value: 'add-source', label: 'Add source', meta: 'Connect Jira, Linear, or GitHub', mark: '+' },
            ]}
            onSelect={value => {
              if (value === 'add-source') return;
              setSource(value as 'jira' | 'linear' | 'github');
            }}
          />
          <PickerCard
            label="Team"
            value={entity === 'mobile' ? 'Mobile App' : entity === 'app-claimed' ? 'Growth Platform' : 'Core Platform'}
            valueChip={entity === 'mobile' ? 'Kanban' : entity === 'app-claimed' ? 'Claimed' : 'Scrum'}
            mark="↳"
            options={[
              { value: 'platform', label: 'Core Platform', meta: 'Scrum · available' },
              { value: 'mobile', label: 'Mobile App', meta: 'Kanban · available' },
              { value: 'app-claimed', label: 'Growth Platform', meta: 'Claimed · Growth' },
              { value: 'infra-claimed', label: 'Infrastructure', meta: 'Claimed · Infrastructure' },
              { value: 'growth', label: 'Activation', meta: 'Kanban · available' },
            ]}
            onSelect={value => {
              if (value.includes('claimed')) return;
              setEntity(value);
              setCycleLabel(value === 'mobile' ? 'Cycle' : 'Sprint');
            }}
          />
        </div>
      </div>

      <div className={styles.sourceFacts}>
        <Typography as="p" size="sm" weight="semibold">{selectedEntity.type}</Typography>
        <Typography as="p" size="sm" color="muted">Cadence from source: {selectedEntity.cadence}</Typography>
        <Select label="Call it" value={cycleLabel} onChange={setCycleLabel} options={[{ value: 'Sprint', label: 'Sprint' }, { value: 'Cycle', label: 'Cycle' }, { value: 'Iteration', label: 'Iteration' }]} />
      </div>

      <div className={styles.formPanel}>
        <MappingTable
          title="Status"
          rows={[
            ['To Do', 'Needs breakdown'],
            ['Selected for Development', 'Ready'],
            ['In Progress', 'In flight'],
            ['Done', 'Closed'],
          ]}
        />
      </div>

      <div className={styles.formPanel}>
        <MappingTable
          title="Priority"
          rows={[
            ['Highest', 'Urgent'],
            ['High', 'High'],
            ['Medium', 'Normal'],
            ['Low', 'Low'],
          ]}
        />
      </div>

      <div className={styles.formPanel}>
        <MappingTable
          title="Difficulty"
          rows={[
            ['1 point', 'Tiny'],
            ['3 points', 'Small'],
            ['5 points', 'Medium'],
            ['8+ points', 'Large'],
          ]}
        />
      </div>

      <SaveRow />
    </div>
  );
}

function TeamDefaultsSection() {
  return (
    <div className={styles.stack}>
      <div className={styles.formPanel}>
        <div className={styles.formGridTwo}>
          <div className={styles.fieldGroup}><Typography as="label" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>Default start</Typography><TextInput type="time" defaultValue="09:00" /></div>
          <div className={styles.fieldGroup}><Typography as="label" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>Default end</Typography><TextInput type="time" defaultValue="17:00" /></div>
        </div>
      </div>
      <SaveRow />
    </div>
  );
}

function AccountSection() {
  return (
    <div className={styles.stack}>
      <div className={styles.formPanel}>
        <div className={styles.formGridTwo}>
          <div className={styles.fieldGroup}><Typography as="label" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>Name</Typography><TextInput defaultValue="Alex Johnson" /></div>
          <div className={styles.fieldGroup}><Typography as="label" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>Email</Typography><TextInput type="email" defaultValue="alex@acme.test" /></div>
        </div>
      </div>
      <div className={styles.formPanel}>
        <ToggleRow title="Trusted device" detail="This browser is remembered for sign-in." defaultOn />
      </div>
      <SaveRow />
    </div>
  );
}

type ChoicePanelProps = {
  title: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string, string]>;
};

function ChoicePanel({ title, value, onChange, options }: ChoicePanelProps) {
  return (
    <div className={styles.formPanel}>
      <div className={styles.panelHeader}>
        <Typography as="h3" size="lg" weight="semibold">{title}</Typography>
      </div>
      <div className={styles.optionList}>
        {options.map(([optionValue, label, detail]) => (
          <button
            className={value === optionValue ? `${styles.optionRow} ${styles.optionRowActive}` : styles.optionRow}
            key={optionValue}
            onClick={() => onChange(optionValue)}
            type="button"
          >
            <span>
              <Typography as="span" size="sm" weight="semibold">{label}</Typography>
              <Typography as="span" size="xs" color="muted" className={styles.optionDetail}>{detail}</Typography>
            </span>
            {value === optionValue ? <Badge variant="accent">Selected</Badge> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

type EventTypeRowProps = {
  name: string;
  tone: string;
};

function EventTypeRow({ name, tone }: EventTypeRowProps) {
  const dotClassName = [styles.eventDot, styles[`eventDot${tone}`]].filter(Boolean).join(' ');

  return (
    <div className={styles.eventTypeRow}>
      <span className={dotClassName} aria-hidden="true" />
      <Typography as="p" size="sm" weight="semibold">{name}</Typography>
      <Button variant="ghost" size="sm">Edit</Button>
    </div>
  );
}

type BudgetRowProps = {
  name: string;
  value: string;
  unit: string;
  tone: string;
};

function BudgetRow({ name, value, unit, tone }: BudgetRowProps) {
  const dotClassName = [styles.eventDot, styles[`eventDot${tone}`]].filter(Boolean).join(' ');

  return (
    <div className={styles.budgetRow}>
      <span className={dotClassName} aria-hidden="true" />
      <Typography as="p" size="sm" weight="semibold">{name}</Typography>
      <div className={styles.budgetValueInput}>
        <TextInput type="number" defaultValue={value} min="0" />
        <Typography as="span" size="sm" color="muted" weight="semibold">{unit}</Typography>
      </div>
    </div>
  );
}

type ToggleRowProps = {
  title: string;
  detail: string;
  defaultOn?: boolean;
};

function ToggleRow({ title, detail, defaultOn = false }: ToggleRowProps) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <button className={styles.toggleRow} onClick={() => setEnabled(value => !value)} type="button">
      <span>
        <Typography as="span" size="sm" weight="semibold">{title}</Typography>
        <Typography as="span" size="xs" color="muted" className={styles.optionDetail}>{detail}</Typography>
      </span>
      <span className={enabled ? `${styles.switch} ${styles.switchOn}` : styles.switch} aria-hidden="true">
        <span />
      </span>
    </button>
  );
}

type IconComponent = ElementType<{
  size?: number;
  weight?: 'regular' | 'bold' | 'fill';
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}>;

type IconOption = {
  name: string;
  icon: IconComponent;
};

const allIconOptions: IconOption[] = Object.values(
  Object.entries(PhosphorIcons)
    .filter(([name, value]) => (
      /^[A-Z]/.test(name)
      && !['Icon', 'IconBase', 'IconContext', 'IconWeight'].includes(name)
      && !name.endsWith('Context')
      && !name.includes('Logo')
      && typeof value === 'object'
      && value !== null
      && '$$typeof' in value
    ))
    .reduce<Record<string, IconOption>>((acc, [name, icon]) => {
      const baseName = name.replace(/Icon$/, '');
      const existing = acc[baseName];

      if (!existing || !name.endsWith('Icon')) {
        acc[baseName] = { name: baseName, icon: icon as IconComponent };
      }

      return acc;
    }, {})
).sort((a, b) => a.name.localeCompare(b.name));

function CheckFallbackIcon() {
  return <span className={styles.fallbackIcon}>✓</span>;
}

type IconPickerProps = {
  icon: string;
  onChange: (icon: string) => void;
};

function IconPicker({ icon, onChange }: IconPickerProps) {
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(120);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const iconOptions = useMemo(() => allIconOptions.filter(option => option.icon), []);
  const selected = iconOptions.find(option => option.name === icon)
    ?? iconOptions.find(option => option.name === 'CheckCircle')
    ?? null;
  const SelectedIcon = selected?.icon ?? CheckFallbackIcon;
  const normalizedQuery = query.toLowerCase().trim();
  const filteredOptions = useMemo(
    () => iconOptions.filter(option => option.name.toLowerCase().includes(normalizedQuery)),
    [iconOptions, normalizedQuery]
  );
  const visibleOptions = filteredOptions.slice(0, visibleCount);

  return (
    <Popover
      side="right"
      align="center"
      sideOffset={6}
      trigger={<SelectedIcon size={15} weight="bold" aria-label="Mapping icon" />}
      triggerClassName={styles.iconTrigger}
      popupClassName={styles.iconMenu}
    >
      <TextInput
        placeholder="Search Phosphor icons"
        value={query}
        onChange={event => {
          setQuery(event.target.value);
          setVisibleCount(120);
        }}
      />
      <div
        className={styles.iconGrid}
        onScroll={event => {
          const target = event.currentTarget;
          const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 72;

          if (!nearBottom || isLoadingMore || visibleCount >= filteredOptions.length) return;

          setIsLoadingMore(true);
          window.requestAnimationFrame(() => {
            setVisibleCount(count => Math.min(count + 96, filteredOptions.length));
            setIsLoadingMore(false);
          });
        }}
      >
        {visibleOptions.map(option => {
          const Icon = option.icon;

          return (
            <button
              className={icon === option.name ? `${styles.iconOption} ${styles.iconOptionActive}` : styles.iconOption}
              key={option.name}
              onClick={() => onChange(option.name)}
              title={option.name}
              type="button"
            >
              <Icon size={17} weight="bold" aria-hidden />
            </button>
          );
        })}
      </div>
    </Popover>
  );
}

type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
};

const badgeColors = ['accent', 'success', 'warning', 'danger', 'violet', 'cyan', 'slate'] as const;

function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <Popover
      side="right"
      align="center"
      sideOffset={6}
      trigger={(
        <span className={styles.colorTriggerInner} aria-label="Badge color">
          <span className={`${styles.colorDot} ${styles[`color${color}`]}`} />
          <CaretDown size={10} weight="bold" aria-hidden="true" />
        </span>
      )}
      triggerClassName={styles.colorTrigger}
      popupClassName={styles.colorMenu}
    >
      {badgeColors.map(option => (
        <button
          className={`${styles.colorSwatch} ${styles[`color${option}`]} ${color === option ? styles.colorSelected : ''}`}
          aria-label={option}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        />
      ))}
    </Popover>
  );
}

function SaveRow() {
  return (
    <div className={styles.actionRow}>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save changes</Button>
    </div>
  );
}

type LogoValue = string | ReactNode;

type PickerOption = {
  value: string;
  label: string;
  meta: string;
  mark?: LogoValue;
};

type CompactPickerProps = {
  label: string;
  value: string;
  meta: string;
  options: PickerOption[];
  onSelect: (value: string) => void;
};

function CompactPicker({ label, value, meta, options, onSelect }: CompactPickerProps) {
  return (
    <Popover
      sideOffset={3}
      trigger={(
        <>
          <span className={styles.scopeCopy}>
            <span className={styles.scopeLabel}>{label}</span>
            <span className={styles.scopeName}>{value}</span>
          </span>
          <span className={styles.scopeMeta}>{meta}</span>
          <CaretDown size={14} aria-hidden="true" />
        </>
      )}
      triggerClassName={styles.scopeButton}
      popupClassName={styles.scopeMenu}
    >
      {options.map(option => (
        <button className={styles.scopeMenuItem} key={option.value} onClick={() => onSelect(option.value)} type="button">
          <span className={styles.scopeMenuName}>{option.label}</span>
          <span className={styles.scopeMenuMeta}>{option.meta}</span>
        </button>
      ))}
    </Popover>
  );
}

type PickerCardProps = {
  label: string;
  value: string;
  valueChip?: string;
  mark: LogoValue;
  options: PickerOption[];
  onSelect: (value: string) => void;
};

function PickerCard({ label, value, valueChip, mark, options, onSelect }: PickerCardProps) {
  return (
    <Popover
      sideOffset={4}
      trigger={(
        <>
          <span className={styles.pickerMark}>{mark}</span>
          <span className={styles.pickerCopy}>
            <span className={styles.pickerLabel}>{label}</span>
            <span className={styles.pickerValueLine}>
              <span className={styles.pickerValue}>{value}</span>
              {valueChip ? <span className={styles.sourceChip}>{valueChip}</span> : null}
            </span>
          </span>
          <CaretDown size={15} aria-hidden="true" />
        </>
      )}
      triggerClassName={styles.pickerButton}
      popupClassName={styles.pickerMenu}
    >
      {options.map(option => {
        const [chip, detail] = option.meta.split(' · ');
        const isClaimed = chip === 'Claimed';
        const showChip = option.value !== 'add-source';
        const chipClassName = [
          styles.sourceChip,
          chip === 'Jira' ? styles.sourceChipJira : undefined,
          chip === 'Linear' ? styles.sourceChipLinear : undefined,
          chip === 'GitHub' ? styles.sourceChipGithub : undefined,
        ].filter(Boolean).join(' ');

        return (
          <button
            className={[
              styles.pickerMenuItem,
              option.mark ? styles.pickerMenuItemWithMark : undefined,
              isClaimed ? styles.pickerMenuItemDisabled : undefined,
            ].filter(Boolean).join(' ')}
            key={option.value}
            onClick={() => onSelect(option.value)}
            type="button"
          >
            {option.mark ? <span className={styles.sourceMiniLogo}>{option.mark}</span> : null}
            <span className={styles.pickerMenuCopy}>
              <span className={styles.pickerMenuTitleLine}>
                <Typography as="span" size="sm" weight="semibold">{option.label}</Typography>
                {showChip ? <span className={chipClassName}>{chip}</span> : null}
              </span>
              {showChip && detail ? (
                <Typography as="span" size="xs" color="muted" className={styles.pickerMenuDetail}>
                  {isClaimed ? `Claimed by Stride team ${detail}` : detail}
                </Typography>
              ) : !showChip ? (
                <Typography as="span" size="xs" color="muted" className={styles.pickerMenuDetail}>{option.meta}</Typography>
              ) : null}
            </span>
          </button>
        );
      })}
    </Popover>
  );
}

type IntegrationCardProps = {
  name: string;
  detail: string;
  status: string;
  logo: LogoValue;
};

function IntegrationCard({ name, detail, status, logo }: IntegrationCardProps) {
  return (
    <div className={styles.integrationCard}>
      <span className={styles.integrationLogo}>{logo}</span>
      <div>
        <Typography as="p" size="base" weight="semibold">{name}</Typography>
        <Typography as="p" size="sm" color="muted">{detail}</Typography>
      </div>
      <Badge variant={status === 'Connected' ? 'success' : 'neutral'}>{status}</Badge>
    </div>
  );
}

type MappingTableProps = {
  title: string;
  rows: Array<[string, string]>;
};

function MappingTable({ title, rows }: MappingTableProps) {
  const [display, setDisplay] = useState('text');

  return (
    <div className={styles.mappingTable}>
      <div className={styles.mappingHeaderRow}>
        <Typography as="h3" size="lg" weight="semibold">{title}</Typography>
      </div>
      <div className={styles.mappingColumns}>
        <Typography as="p" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>Source</Typography>
        <div className={styles.strideHeaderControls}>
          <Typography as="p" size="xs" weight="semibold" color="muted" className={styles.fieldLabel}>Stride</Typography>
          <div className={styles.segmentedControl}>
            <button className={display === 'text' ? styles.segmentActive : undefined} onClick={() => setDisplay('text')} type="button">Text</button>
            <button className={display === 'icon' ? styles.segmentActive : undefined} onClick={() => setDisplay('icon')} type="button">Icon</button>
          </div>
        </div>
      </div>
      {rows.map(([source, stride], index) => (
        <div className={styles.mappingColumns} key={`${source}-${stride}`}>
          <MappingBadge label={source} index={index} display="text" />
          <MappingBadge label={stride} index={index + 1} display={display} editable />
        </div>
      ))}
    </div>
  );
}

type MappingBadgeProps = {
  label: string;
  index: number;
  display: string;
  editable?: boolean;
};

function MappingBadge({ label, index, display, editable = false }: MappingBadgeProps) {
  const variants = ['accent', 'success', 'warning', 'danger'] as const;
  const variant = editable ? variants[index % variants.length] : 'neutral';
  const [value, setValue] = useState(label);
  const [icon, setIcon] = useState('CheckCircle');
  const defaultColors = ['warning', 'accent', 'success', 'slate'];
  const [color, setColor] = useState(defaultColors[index % defaultColors.length] ?? 'accent');
  const maxLength = display === 'icon' ? 2 : 14;
  const chipClassName = [styles.editableBadge, styles[`editableBadge${color}`]].filter(Boolean).join(' ');

  return (
    <div className={editable ? `${styles.mappingBadgeCell} ${styles.mappingBadgeEditable}` : styles.mappingBadgeCell}>
      {editable ? (
        <>
          {display === 'icon' ? (
            <IconPicker icon={icon} onChange={setIcon} />
          ) : (
            <span className={chipClassName}>
              <input
                aria-label={`Edit ${label}`}
                maxLength={maxLength}
                onChange={event => setValue(event.target.value)}
                value={value}
              />
            </span>
          )}
          <ColorPicker color={color} onChange={setColor} />
        </>
      ) : (
        <Badge variant={variant}>{label}</Badge>
      )}
    </div>
  );
}

type MemberRowProps = {
  name: string;
  email: string;
  detail: string;
};

function MemberRow({ name, email, detail }: MemberRowProps) {
  return (
    <div className={styles.memberRow}>
      <div className={styles.memberAvatar} aria-hidden="true">{name.charAt(0)}</div>
      <div className={styles.memberIdentity}>
        <Typography as="p" size="sm" weight="semibold">{name}</Typography>
        <Typography as="p" size="xs" color="muted">{email}</Typography>
      </div>
      <Typography as="p" size="xs" color="muted" className={styles.memberRole}>{detail}</Typography>
      <Button variant="ghost" size="sm">Manage</Button>
    </div>
  );
}

type ConnectionRowProps = {
  name: string;
  detail: string;
  status: string;
};

function ConnectionRow({ name, detail, status }: ConnectionRowProps) {
  return (
    <div className={styles.connectionRow}>
      <div>
        <Typography as="p" size="base" weight="semibold">{name}</Typography>
        <Typography as="p" size="sm" color="muted">{detail}</Typography>
      </div>
      <Badge variant={status === 'Connected' ? 'success' : 'neutral'}>{status}</Badge>
    </div>
  );
}
