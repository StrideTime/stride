import { useMemo, useState, type ElementType, type ReactNode } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';
import * as PhosphorIcons from '@phosphor-icons/react';
import {
  ArrowLeft,
  Bell,
  Briefcase,
  CalendarDots,
  CaretDown,
  Clock,
  GearSix,
  GithubLogo,
  House,
  LinkSimple,
  LockKey,
  PaintBrush,
  PlugsConnected,
  ShieldCheck,
  SlidersHorizontal,
  User,
  UsersThree,
} from '@phosphor-icons/react';
import { Badge, Button, Popover, Select, TextInput, Typography } from '@stride/ui';

import styles from './SettingsView.module.css';

export type SettingsSectionId =
  | 'my-workspace'
  | 'my-calendar'
  | 'my-notifications'
  | 'my-time-budgets'
  | 'my-event-types'
  | 'account'
  | 'appearance'
  | 'personal-connections'
  | 'privacy'
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
        id: 'privacy',
        label: 'Privacy',
        description: 'Presence sharing inside Stride safety limits.',
        icon: LockKey,
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
    case 'privacy':
      return <PrivacySection />;
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

function PrivacySection() {
  return (
    <div className={styles.stack}>
      <div className={styles.formPanel}>
        <ToggleRow title="Focus status" detail="Let teammates see when you are in deep work." defaultOn />
        <ToggleRow title="Nudges" detail="Allow teammates to nudge blocked work assigned to you." defaultOn />
        <ToggleRow title="Session notes" detail="Keep notes private by default." defaultOn />
      </div>
      <SaveRow />
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
        <ToggleRow title="Aggregate insights only" detail="Workspace reports never expose individual session detail." defaultOn />
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
