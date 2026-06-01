import { useMemo, useState, type ElementType, type ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import * as PhosphorIcons from '@phosphor-icons/react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDots,
  CaretDown,
  Timer,
  CaretLeft,
  CaretRight,
  CheckCircle,
  GearSix,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  ShieldCheck,
  Smiley,
  SmileyMeh,
  SmileySad,
  Target,
  Trash,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Popover, Select, TextInput, Typography } from '@stride/ui';

import { useAppMode } from '../app-mode';
import { useStatuses, type StatusColor } from '../statuses';
import {
  ROLE_RANK,
  accentOptions,
  dayOptions,
  fallbackTimeZones,
  initialCalendars,
  settingsGroups,
  sourceAccounts,
  sourceUnits,
  teamMemberRecords,
  teamOptions,
  teamsByWorkspace,
  workspaceMemberRecords,
  workspaceOptions,
  type AccentColor,
  type MemberRecord,
  type Role,
  type SettingsGroup,
  type SettingsSectionId,
  type SimpleOption,
  type SourceAccount,
  type SourceUnit,
} from './settings.mock';
import styles from './SettingsView.module.css';
import { captureRecords, checkInRecords, sessionRecords, type Feeling } from './yourData.mock';

export type { SettingsSectionId } from './settings.mock';

const allSections = settingsGroups.flatMap(group => group.sections);

function canAccess(group: SettingsGroup, workspaceRole: Role) {
  if (!group.minimumRole) return true;

  return ROLE_RANK[workspaceRole] >= ROLE_RANK[group.minimumRole];
}

function roleLabel(role: Role) {
  if (role === 'workspaceAdmin') return 'Workspace admin';
  if (role === 'teamAdmin') return 'Team admin';

  return 'Member';
}

type SettingsViewProps = {
  section?: SettingsSectionId;
};

export function SettingsView({ section }: SettingsViewProps) {
  const [workspaceId, setWorkspaceId] = useState('acme');
  const [teamId, setTeamId] = useState('platform');
  const currentWorkspace =
    workspaceOptions.find((workspace) => workspace.id === workspaceId) ?? workspaceOptions[0]!;
  const adminTeams = (teamsByWorkspace[currentWorkspace.id] ?? []).filter(
    (team) => ROLE_RANK[team.role] >= ROLE_RANK.teamAdmin
  );
  const currentTeam = adminTeams.find((team) => team.id === teamId) ?? adminTeams[0];
  const visibleGroups = settingsGroups.filter(group =>
    group.id === 'team-admin' ? adminTeams.length > 0 : canAccess(group, currentWorkspace.role)
  );
  const hasSelection = section != null;
  const activeSection =
    allSections.find((item) => item.id === section) ??
    allSections.find((item) => item.id === 'my-workspace') ??
    allSections[0]!;

  const selectWorkspace = (nextWorkspaceId: string) => {
    const nextAdminTeams = (teamsByWorkspace[nextWorkspaceId] ?? []).filter(
      (team) => ROLE_RANK[team.role] >= ROLE_RANK.teamAdmin
    );

    setWorkspaceId(nextWorkspaceId);
    setTeamId(nextAdminTeams[0]?.id ?? '');
  };

  return (
    <section className={`${styles.page} ${hasSelection ? styles.pageDetail : styles.pageMenu}`}>
      <aside className={styles.sidebar} aria-label="Settings sections">
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.backLink} aria-label="Back to app">
            <ArrowLeft size={15} weight="bold" aria-hidden="true" />
          </Link>
          <Typography as="h1" size="lg" weight="bold" className={styles.title}>
            Settings
          </Typography>
          <CompactPicker
            icon={Briefcase}
            value={currentWorkspace.name}
            options={workspaceOptions.map((workspace) => ({
              value: workspace.id,
              label: workspace.name,
              meta: roleLabel(workspace.role),
            }))}
            onSelect={selectWorkspace}
            footer={
              <Link to="/workspaces/new" className={styles.scopeMenuAction}>
                <Plus size={14} weight="bold" aria-hidden="true" />
                Create workspace
              </Link>
            }
          />
        </div>

        <nav className={styles.nav}>
          {visibleGroups.map((group) => (
            <div className={styles.navGroup} key={group.id}>
              <div className={styles.groupHeader}>
                <Typography
                  as="p"
                  size="xs"
                  weight="semibold"
                  color="muted"
                  className={styles.groupLabel}
                >
                  {group.label}
                </Typography>
                {group.id === 'team-admin' && currentTeam ? (
                  <CompactPicker
                    value={currentTeam.name}
                    options={adminTeams.map((team) => ({
                      value: team.id,
                      label: team.name,
                      meta: `${team.source} · ${roleLabel(team.role)}`,
                    }))}
                    onSelect={setTeamId}
                  />
                ) : null}
              </div>
              <div className={styles.navItems}>
                {group.sections.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === section;

                  return (
                    <Link
                      className={isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                      key={item.id}
                      to="/settings"
                      search={{ section: item.id }}
                    >
                      <Icon aria-hidden="true" size={16} weight={isActive ? 'fill' : 'regular'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className={styles.content}>
        <div className={styles.mobileBackstop}>
          <Link to="/settings" search={{}} className={styles.mobileBackButton}>
            <CaretLeft size={15} weight="bold" aria-hidden="true" />
            <span>All settings</span>
          </Link>
        </div>
        <header className={styles.contentHeader}>
          <Typography as="h2" size="2xl" weight="bold">
            {activeSection.label}
          </Typography>
          {activeSection.description ? (
            <Typography as="p" size="base" color="muted" className={styles.description}>
              {activeSection.description}
            </Typography>
          ) : null}
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
    case 'account':
      return <AccountSection />;
    case 'appearance':
      return <AppearanceSection />;
    case 'my-statuses':
      return <MyStatusesSection />;
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

type WorkingHoursRow = {
  id: string;
  day: string;
  start: string;
  end: string;
};

function formatTimeZone(zone: string) {
  const [region = zone, ...rest] = zone.split('/');
  return {
    value: zone,
    label: rest.join(' / ').replaceAll('_', ' ') || region,
    meta: rest.length > 0 ? region.replaceAll('_', ' ') : 'Standard',
  };
}

const timeZoneOptions = (
  typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : fallbackTimeZones
).map(formatTimeZone);

function MyWorkspaceSection() {
  const { mode, setMode } = useAppMode();
  const [timezone, setTimezone] = useState('America/Denver');
  const [workingHours, setWorkingHours] = useState<WorkingHoursRow[]>([
    { id: 'hours-1', day: 'Monday', start: '09:00', end: '17:00' },
    { id: 'hours-2', day: 'Tuesday', start: '09:00', end: '17:00' },
    { id: 'hours-3', day: 'Wednesday', start: '09:00', end: '17:00' },
    { id: 'hours-4', day: 'Thursday', start: '09:00', end: '17:00' },
    { id: 'hours-5', day: 'Friday', start: '09:00', end: '17:00' },
  ]);

  const updateWorkingHours = (id: string, patch: Partial<WorkingHoursRow>) => {
    setWorkingHours((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addWorkingHours = () => {
    setWorkingHours((rows) => [
      ...rows,
      {
        id: `hours-${Date.now()}`,
        day: 'Monday',
        start: '09:00',
        end: '17:00',
      },
    ]);
  };

  const removeWorkingHours = (id: string) => {
    setWorkingHours((rows) => (rows.length === 1 ? rows : rows.filter((row) => row.id !== id)));
  };

  return (
    <div className={styles.overviewStack}>
      <section className={styles.overviewSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Working hours
          </Typography>
        </div>
        <div className={styles.workingHoursEditor}>
          <SearchableSelect
            label="Timezone"
            value={timezone}
            options={timeZoneOptions}
            onChange={setTimezone}
          />
          <div className={styles.workingHoursList}>
            {workingHours.map((row) => (
              <div className={styles.workingHoursRow} key={row.id}>
                <Select
                  label=""
                  value={row.day}
                  onChange={(value) => updateWorkingHours(row.id, { day: value })}
                  options={dayOptions}
                />
                <div className={styles.fieldGroup}>
                  <Typography
                    as="label"
                    size="xs"
                    weight="semibold"
                    color="muted"
                    className={styles.fieldLabel}
                  >
                    Start
                  </Typography>
                  <TextInput
                    type="time"
                    value={row.start}
                    onChange={(event) => updateWorkingHours(row.id, { start: event.target.value })}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <Typography
                    as="label"
                    size="xs"
                    weight="semibold"
                    color="muted"
                    className={styles.fieldLabel}
                  >
                    End
                  </Typography>
                  <TextInput
                    type="time"
                    value={row.end}
                    onChange={(event) => updateWorkingHours(row.id, { end: event.target.value })}
                  />
                </div>
                <button
                  aria-label="Remove working hours row"
                  className={styles.removeHoursButton}
                  disabled={workingHours.length === 1}
                  onClick={() => removeWorkingHours(row.id)}
                  type="button"
                >
                  <Trash size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className={styles.addWorkingHoursButton}
            icon={<Plus size={14} weight="bold" />}
            onClick={addWorkingHours}
          >
            Add day
          </Button>
        </div>
      </section>

      <section className={styles.overviewSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Working mode
          </Typography>
        </div>
        <div className={styles.workModeGrid}>
          <WorkModeOption
            active={mode === 'session-first'}
            icon={<Timer size={24} weight="bold" aria-hidden="true" />}
            label="Session-first"
            summary="Start and stop sessions. Sessions count as time worked."
            onSelect={() => setMode('session-first')}
          />
          <WorkModeOption
            active={mode === 'schedule-first'}
            icon={<CalendarDots size={24} weight="bold" aria-hidden="true" />}
            label="Schedule-first"
            summary="Work time comes from what is scheduled on your calendar."
            onSelect={() => setMode('schedule-first')}
          />
        </div>
        {mode === 'session-first' ? (
          <div className={styles.workModeConditional}>
            <ToggleRow
              title="End-of-session check-in"
              detail="Ask how the session went before closing it."
              defaultOn
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function NotificationsSection() {
  const [summaryTime, setSummaryTime] = useState('17:00');

  return (
    <div className={styles.plainStack}>
      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Sessions &amp; focus
          </Typography>
        </div>
        <div className={styles.toggleList}>
          <ToggleRow
            title="Session start reminder"
            detail="Nudge me to start a session I planned but haven't begun."
            defaultOn
          />
          <ToggleRow
            title="Idle session check"
            detail="Ask if I'm still working when a running session goes quiet."
            defaultOn
          />
          <ToggleRow
            title="Variance nudge"
            detail="Warn me when a session runs far past its estimate."
            defaultOn
          />
          <ToggleRow
            title="Break reminder"
            detail="Suggest a break after a long unbroken stretch of focus."
          />
          <ToggleRow
            title="Session recap"
            detail="Show a quick recap of time and progress when a session ends."
            defaultOn
          />
        </div>
      </section>

      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Schedule &amp; meetings
          </Typography>
        </div>
        <div className={styles.toggleList}>
          <ToggleRow
            title="Meeting prompts"
            detail="Show a tray prompt a few minutes before calendar meetings."
            defaultOn
          />
          <ToggleRow
            title="Meeting start ping"
            detail="Ping me right when a meeting is starting."
            defaultOn
          />
          <ToggleRow
            title="Upcoming block reminder"
            detail="Remind me before a scheduled work block begins."
          />
          <ToggleRow
            title="Schedule conflicts"
            detail="Flag when two blocks or a meeting and a block overlap."
            defaultOn
          />
          <ToggleRow
            title="Unplanned day nudge"
            detail="Remind me to plan a day that still has open time."
          />
        </div>
      </section>

      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Work &amp; specs
          </Typography>
        </div>
        <div className={styles.toggleList}>
          <ToggleRow
            title="New work assigned"
            detail="Tell me when work is assigned to me from a source."
            defaultOn
          />
          <ToggleRow
            title="Spec ready to plan"
            detail="Notify me when a new spec lands and is ready to break down."
            defaultOn
          />
          <ToggleRow
            title="Due-date reminder"
            detail="Flag actions as their due date approaches."
            defaultOn
          />
          <ToggleRow
            title="Stale spec reminder"
            detail="Remind me about specs sitting untouched for a while."
          />
          <ToggleRow
            title="Blocked action alert"
            detail="Let me know when something I'm waiting on becomes unblocked."
          />
        </div>
      </section>

      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Summaries &amp; progress
          </Typography>
        </div>
        <div className={styles.toggleList}>
          <ToggleRow
            title="Daily summary"
            detail="A recap of the day sent at the end of your workday."
            defaultOn
          />
          <ToggleRow
            title="Weekly review"
            detail="A wider look back at your week, sent Friday afternoon."
            defaultOn
          />
          <ToggleRow
            title="Streaks & milestones"
            detail="Celebrate personal streaks and milestones as you hit them."
          />
          <ToggleRow
            title="Goal progress"
            detail="Check in on progress toward goals you've set for yourself."
          />
        </div>
        <div className={styles.inlineSelect}>
          <Select
            label="Send daily summary at"
            value={summaryTime}
            onChange={setSummaryTime}
            options={[
              { value: '16:00', label: '4:00 PM' },
              { value: '17:00', label: '5:00 PM' },
              { value: '18:00', label: '6:00 PM' },
              { value: '19:00', label: '7:00 PM' },
            ]}
          />
        </div>
      </section>

      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Workspace &amp; team
          </Typography>
        </div>
        <div className={styles.toggleList}>
          <ToggleRow
            title="Workspace announcements"
            detail="Messages and changes from workspace admins."
            defaultOn
          />
          <ToggleRow
            title="Invitations & role changes"
            detail="When you're added to a team or your role changes."
            defaultOn
          />
          <ToggleRow
            title="Aggregate team insights"
            detail="When new aggregate patterns are published for your team."
          />
        </div>
      </section>

      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Delivery
          </Typography>
        </div>
        <div className={styles.toggleList}>
          <ToggleRow
            title="Desktop tray"
            detail="Show notifications in the desktop app tray."
            defaultOn
          />
          <ToggleRow title="Email" detail="Send notifications to your account email." />
          <ToggleRow title="Mobile push" detail="Push notifications to the mobile app." defaultOn />
          <ToggleRow
            title="Quiet hours"
            detail="Hold non-urgent notifications outside your working hours."
            defaultOn
          />
        </div>
      </section>
    </div>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState<AccentColor>('blue');

  const changeTheme = (nextTheme: string) => {
    setTheme(nextTheme);
    if (typeof document === 'undefined') return;

    if (nextTheme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset.theme = nextTheme;
  };

  return (
    <div className={styles.plainStack}>
      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Theme
          </Typography>
        </div>
        <div className={styles.themeGrid}>
          <ThemeOption
            active={theme === 'dark'}
            label="Dark"
            tone="dark"
            onSelect={() => changeTheme('dark')}
          />
          <ThemeOption
            active={theme === 'light'}
            label="Light"
            tone="light"
            onSelect={() => changeTheme('light')}
          />
          <ThemeOption
            active={theme === 'system'}
            label="System"
            tone="system"
            onSelect={() => changeTheme('system')}
          />
        </div>
      </section>
      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Accent color
          </Typography>
        </div>
        <AccentSelector accent={accent} onChange={setAccent} />
      </section>
    </div>
  );
}

const STATUS_NAME_MAX_LENGTH = 24;

function MyStatusesSection() {
  const { statuses, currentStatusId, addStatus, updateStatus, removeStatus } = useStatuses();

  return (
    <div className={styles.overviewStack}>
      <section className={styles.overviewSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Statuses
          </Typography>
        </div>
        <div className={styles.statusEditor}>
          <div className={styles.statusList}>
            {statuses.map((status) => (
              <div className={styles.statusRow} key={status.id}>
                <StatusAppearancePicker
                  color={status.color}
                  icon={status.icon}
                  onColorChange={(value) =>
                    updateStatus(status.id, { color: value as StatusColor })
                  }
                  onIconChange={(value) => updateStatus(status.id, { icon: value })}
                />
                <label
                  className={styles.statusNameField}
                  data-value={status.label || 'Status name'}
                >
                  <input
                    className={styles.statusNameInput}
                    aria-label="Status name"
                    placeholder="Status name"
                    maxLength={STATUS_NAME_MAX_LENGTH}
                    value={status.label}
                    onChange={(event) => updateStatus(status.id, { label: event.target.value })}
                  />
                </label>
                <div className={styles.statusRowActions}>
                  {status.id === currentStatusId ? <Badge variant="success">Current</Badge> : null}
                  <button
                    aria-label={`Remove ${status.label} status`}
                    className={styles.statusRemove}
                    disabled={statuses.length === 1}
                    onClick={() => removeStatus(status.id)}
                    type="button"
                  >
                    <Trash size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className={styles.statusAddButton}
            icon={<Plus size={14} weight="bold" />}
            onClick={addStatus}
          >
            Add status
          </Button>
        </div>
      </section>
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
      <Typography as="p" size="sm" color="muted">
        {body}
      </Typography>
    </div>
  );
}

function FeelingTag({ feeling }: { feeling: Feeling | null }) {
  if (!feeling) {
    return (
      <Typography as="span" size="xs" color="muted">
        Not logged
      </Typography>
    );
  }
  const meta = FEELING_META[feeling];
  const Icon = meta.icon;
  return (
    <span className={styles.feelingTag}>
      <Icon size={15} weight="fill" aria-hidden="true" />
      <Typography as="span" size="xs" weight="semibold">
        {meta.label}
      </Typography>
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
        <Typography as="p" size="sm" weight="semibold">
          {emptyTitle}
        </Typography>
        <Typography as="p" size="sm" color="muted">
          {emptyBody}
        </Typography>
      </div>
    );
  }

  const gridClassName = [styles.dataGrid, styles[gridClass]].filter(Boolean).join(' ');

  return (
    <div className={styles.dataTable} role="table">
      <div className={`${styles.dataHead} ${gridClassName}`} role="row">
        {columns.map((column) => (
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
      {rows.map((row) =>
        confirmId === row.id ? (
          <div className={styles.dataConfirm} key={row.id} role="row">
            <Typography as="p" size="sm">
              {row.confirmText}
            </Typography>
            <div className={styles.confirmActions}>
              <Button size="sm" variant="ghost" onClick={() => onConfirm(null)}>
                Cancel
              </Button>
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
      )}
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
  const [exportState, setExportState] = useState<'idle' | 'working' | 'done'>('idle');

  const counts: Record<DataCategory, number> = {
    sessions: sessions.length,
    checkins: checkins.length,
    captures: captures.length,
  };
  const normalizedQuery = query.trim().toLowerCase();

  const allRows = useMemo<DataTableRow[]>(() => {
    if (category === 'sessions') {
      return sessions
        .filter(
          (record) =>
            normalizedQuery === '' ||
            record.actionTitle.toLowerCase().includes(normalizedQuery) ||
            (record.specKey?.toLowerCase().includes(normalizedQuery) ?? false)
        )
        .map((record) => ({
          id: record.id,
          deleteLabel: `Delete session on ${record.actionTitle}`,
          confirmText: 'Delete this session? Its logged time and check-in are removed with it.',
          cells: [
            <Typography key="when" as="span" size="sm" color="muted">
              {formatWhen(record.at)}
            </Typography>,
            <span key="action" className={styles.titleCell}>
              <Typography as="span" size="sm" weight="semibold" className={styles.truncate}>
                {record.actionTitle}
              </Typography>
              {record.specKey ? (
                <span className={styles.specKey}>{record.specKey}</span>
              ) : (
                <Typography as="span" size="xs" color="muted">
                  Personal
                </Typography>
              )}
            </span>,
            <Typography key="duration" as="span" size="sm">
              {formatDuration(record.durationMin)}
            </Typography>,
            <FeelingTag key="felt" feeling={record.feeling} />,
          ],
        }));
    }
    if (category === 'checkins') {
      return checkins
        .filter(
          (record) =>
            normalizedQuery === '' ||
            record.note.toLowerCase().includes(normalizedQuery) ||
            record.onAction.toLowerCase().includes(normalizedQuery)
        )
        .map((record) => ({
          id: record.id,
          deleteLabel: `Delete check-in from ${formatWhen(record.at)}`,
          confirmText: 'Delete this check-in? The session it belongs to stays.',
          cells: [
            <Typography key="when" as="span" size="sm" color="muted">
              {formatWhen(record.at)}
            </Typography>,
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
      .filter(
        (record) =>
          normalizedQuery === '' ||
          record.text.toLowerCase().includes(normalizedQuery) ||
          record.kind.toLowerCase().includes(normalizedQuery)
      )
      .map((record) => ({
        id: record.id,
        deleteLabel: `Delete capture from ${formatWhen(record.at)}`,
        confirmText: 'Delete this capture?',
        cells: [
          <Typography key="when" as="span" size="sm" color="muted">
            {formatWhen(record.at)}
          </Typography>,
          <Badge key="kind" variant={record.kind === 'Insight' ? 'accent' : 'neutral'}>
            {record.kind}
          </Badge>,
          <Typography key="text" as="span" size="sm" className={styles.truncate}>
            {record.text}
          </Typography>,
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
    if (category === 'sessions') setSessions((rows) => rows.filter((record) => record.id !== id));
    else if (category === 'checkins')
      setCheckins((rows) => rows.filter((record) => record.id !== id));
    else setCaptures((rows) => rows.filter((record) => record.id !== id));
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
      link.download = 'stride-privacy-and-data.json';
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
    sessions: [
      'No sessions recorded',
      'When you run a timed session it lands here, fully under your control.',
    ],
    checkins: [
      'No check-ins recorded',
      'A check-in is the quick how-did-it-go you log when a session ends.',
    ],
    captures: [
      'No captures recorded',
      'Captures are quick notes you take during a session with the capture shortcut.',
    ],
  };
  const gridByCategory: Record<DataCategory, string> = {
    sessions: 'gridSessions',
    checkins: 'gridCheckins',
    captures: 'gridCaptures',
  };
  const filteredEmpty = normalizedQuery !== '' && allRows.length === 0;

  return (
    <div className={styles.plainStack}>
      <section className={styles.plainSection}>
        <div className={styles.toggleList}>
          <ToggleRow
            title="Share focus status"
            detail="Let teammates see when you're focused or free."
          />
          <ToggleRow
            title="Show live session indicator"
            detail="Show teammates you're in a work block."
          />
        </div>
        <GuaranteeNote body="Team reports show aggregate patterns only. Your individual sessions, check-ins, and captures stay private." />
      </section>

      <section className={styles.plainSection}>
        <div className={styles.dataHeader}>
          <div className={styles.panelHeader}>
            <Typography as="h3" size="lg" weight="semibold">
              Your records
            </Typography>
          </div>
          <div className={styles.dataExport}>
            {exportState === 'done' ? (
              <span className={styles.exportDone}>
                <CheckCircle size={16} weight="fill" aria-hidden="true" />
                <Typography as="span" size="xs" color="muted">
                  Downloaded
                </Typography>
              </span>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              onClick={exportData}
              disabled={exportState === 'working'}
            >
              {exportState === 'working' ? 'Exporting…' : 'Export JSON'}
            </Button>
          </div>
        </div>

        <div className={styles.dataToolbar}>
          <div className={styles.dataTabs}>
            {DATA_CATEGORIES.map((value) => (
              <button
                aria-pressed={value === category}
                className={
                  value === category ? `${styles.dataTab} ${styles.dataTabActive}` : styles.dataTab
                }
                key={value}
                onClick={() => selectCategory(value)}
                type="button"
              >
                {CATEGORY_LABEL[value]}
                <span className={styles.dataTabCount}>{counts[value]}</span>
              </button>
            ))}
          </div>
          <label className={styles.dataSearch}>
            <MagnifyingGlass size={15} aria-hidden="true" />
            <input
              aria-label={`Search ${CATEGORY_LABEL[category].toLowerCase()}`}
              onChange={(event) => updateQuery(event.target.value)}
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
          emptyTitle={
            filteredEmpty ? `Nothing matches “${query.trim()}”` : emptyByCategory[category][0]
          }
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
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  type="button"
                >
                  <CaretLeft size={14} aria-hidden="true" />
                </button>
                <Typography
                  as="span"
                  size="xs"
                  color="muted"
                >{`${safePage + 1} / ${pageCount}`}</Typography>
                <button
                  aria-label="Next page"
                  className={styles.pagerButton}
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                  type="button"
                >
                  <CaretRight size={14} aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function WorkspaceGeneralSection() {
  const [invitePermission, setInvitePermission] = useState('workspace-and-team-admins');
  const [grantTeamAdminPermission, setGrantTeamAdminPermission] = useState('workspace-admins');
  const [sourceRequestPermission, setSourceRequestPermission] = useState('team-admins');
  const [unmappedSourceUnits, setUnmappedSourceUnits] = useState('admin-review');
  const [crossTeamMoves, setCrossTeamMoves] = useState('destination-team-admin');
  const [awaitingApprovalItems, setAwaitingApprovalItems] = useState('backlog-attention');

  return (
    <div className={styles.adminSurface}>
      <section className={styles.adminBlock}>
        <div className={styles.workspaceIdentityGrid}>
          <button
            className={styles.workspaceLogoButton}
            type="button"
            aria-label="Change workspace logo"
          >
            <span className={styles.workspaceLogoPreview} aria-hidden="true">
              <span className={styles.workspaceLogoInitial}>A</span>
              <Typography
                as="span"
                size="xs"
                weight="semibold"
                className={styles.workspaceLogoOverlay}
              >
                Change
              </Typography>
            </span>
          </button>
          <div className={styles.identityFields}>
            <div className={styles.fieldGroup}>
              <Typography
                as="label"
                size="xs"
                weight="semibold"
                color="muted"
                className={styles.fieldLabel}
              >
                Workspace name
              </Typography>
              <TextInput defaultValue="Acme" />
            </div>
            <div className={styles.fieldGroup}>
              <Typography
                as="label"
                size="xs"
                weight="semibold"
                color="muted"
                className={styles.fieldLabel}
              >
                Workspace address
              </Typography>
              <TextInput defaultValue="acme" trailing=".stridetime.app" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.adminBlock}>
        <div className={styles.adminBlockHeader}>
          <Typography as="h3" size="base" weight="semibold">
            Invites
          </Typography>
        </div>
        <div className={styles.adminFieldsWide}>
          <div className={styles.fieldGroup}>
            <Select
              label="Who can invite"
              hideTriggerLabel
              infoText="Controls who can invite new people into this workspace. Team admins can only invite into teams they manage."
              value={invitePermission}
              onChange={setInvitePermission}
              options={[
                { value: 'workspace-admins', label: 'Workspace admins only' },
                {
                  value: 'workspace-and-team-admins',
                  label: 'Workspace and team admins',
                },
                { value: 'all-members', label: 'All members' },
              ]}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Select
              label="Who can grant Team admin"
              hideTriggerLabel
              infoText="Controls who can promote a member to Team admin for a specific team. Workspace admins can always change access."
              value={grantTeamAdminPermission}
              onChange={setGrantTeamAdminPermission}
              options={[
                { value: 'workspace-admins', label: 'Workspace admins only' },
                {
                  value: 'workspace-and-team-admins',
                  label: 'Workspace and team admins',
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className={styles.adminBlock}>
        <div className={styles.adminBlockHeader}>
          <Typography as="h3" size="base" weight="semibold">
            Source requests
          </Typography>
        </div>
        <div className={styles.adminFieldsWide}>
          <div className={styles.fieldGroup}>
            <Select
              label="Who can request connections"
              hideTriggerLabel
              infoText="Controls who can ask to connect Jira, Linear, or GitHub sources to the workspace pool."
              value={sourceRequestPermission}
              onChange={setSourceRequestPermission}
              options={[
                { value: 'workspace-admins', label: 'Workspace admins only' },
                { value: 'team-admins', label: 'Team admins' },
                { value: 'members', label: 'Any member' },
              ]}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Select
              label="Unmapped source units"
              hideTriggerLabel
              infoText="Where a source board, team, or repo goes when it is connected but not mapped to a Stride team yet."
              value={unmappedSourceUnits}
              onChange={setUnmappedSourceUnits}
              options={[
                { value: 'admin-review', label: 'Send to admin review' },
                { value: 'inbox', label: 'Show in Inbox' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className={styles.adminBlock}>
        <div className={styles.adminBlockHeader}>
          <Typography as="h3" size="base" weight="semibold">
            Review rules
          </Typography>
        </div>
        <div className={styles.adminFieldsWide}>
          <div className={styles.fieldGroup}>
            <Select
              label="Cross-team moves"
              hideTriggerLabel
              infoText="Who reviews a source issue when it moves from one Stride team to another."
              value={crossTeamMoves}
              onChange={setCrossTeamMoves}
              options={[
                {
                  value: 'destination-team-admin',
                  label: 'Destination team admin',
                },
                { value: 'workspace-admin', label: 'Workspace admin' },
              ]}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Select
              label="Awaiting approval items"
              hideTriggerLabel
              infoText="Where Stride surfaces source changes that need an admin decision before they enter the team's work queue."
              value={awaitingApprovalItems}
              onChange={setAwaitingApprovalItems}
              options={[
                {
                  value: 'backlog-attention',
                  label: 'Show in Backlog attention',
                },
                { value: 'inbox', label: 'Show in Inbox' },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

type InviteModalState = {
  scope: 'workspace' | 'team';
  mode: 'email' | 'existing';
  initialEmail?: string;
};

function WorkspaceMembersSection() {
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteModal, setInviteModal] = useState<InviteModalState | null>(null);
  return (
    <div className={styles.plainStack}>
      <div className={styles.membersToolbar}>
        <TextInput
          placeholder="teammate@company.com"
          value={inviteEmail}
          onChange={(event) => setInviteEmail(event.target.value)}
        />
        <Button
          variant="primary"
          onClick={() =>
            setInviteModal({ scope: 'workspace', mode: 'email', initialEmail: inviteEmail })
          }
        >
          Invite
        </Button>
      </div>
      <div className={styles.memberListPlain}>
        {workspaceMemberRecords.map(member => (
          <MemberRow key={member.email} member={member} onOpen={() => setSelectedMember(member)} />
        ))}
      </div>
      {selectedMember ? (
        <MemberAccessModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          scope="workspace"
        />
      ) : null}
      {inviteModal ? (
        <InviteMemberModal state={inviteModal} onClose={() => setInviteModal(null)} />
      ) : null}
    </div>
  );
}

function TeamMembersSection() {
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [inviteModal, setInviteModal] = useState<InviteModalState | null>(null);
  return (
    <div className={styles.plainStack}>
      <div className={styles.membersToolbar}>
        <TextInput placeholder="Search Platform members" />
        <Popover
          side="bottom"
          align="end"
          trigger={<span>Add member</span>}
          triggerClassName={styles.addMemberTrigger}
          popupClassName={styles.inviteMenu}
        >
          <button
            className={styles.inviteMenuItem}
            onClick={() => setInviteModal({ scope: 'team', mode: 'existing' })}
            type="button"
          >
            <Typography as="span" size="sm" weight="semibold">
              Add from workspace
            </Typography>
          </button>
          <button
            className={styles.inviteMenuItem}
            onClick={() => setInviteModal({ scope: 'team', mode: 'email' })}
            type="button"
          >
            <Typography as="span" size="sm" weight="semibold">
              Invite by email
            </Typography>
          </button>
        </Popover>
      </div>
      <div className={styles.memberListPlain}>
        {teamMemberRecords.map(member => (
          <MemberRow key={member.email} member={member} onOpen={() => setSelectedMember(member)} />
        ))}
      </div>
      {selectedMember ? (
        <MemberAccessModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          scope="team"
        />
      ) : null}
      {inviteModal ? (
        <InviteMemberModal state={inviteModal} onClose={() => setInviteModal(null)} />
      ) : null}
    </div>
  );
}

function CalendarSection() {
  const [connected, setConnected] = useState(true);
  const [calendars, setCalendars] = useState(initialCalendars);
  const syncedCount = calendars.filter((calendar) => calendar.on).length;

  const toggleCalendar = (id: string) => {
    setCalendars((rows) => rows.map((row) => (row.id === id ? { ...row, on: !row.on } : row)));
  };

  return (
    <div className={styles.plainStack}>
      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Account
          </Typography>
        </div>
        {connected ? (
          <div className={styles.calendarAccountRow}>
            <span className={styles.calendarAccountIcon} aria-hidden="true">
              <CalendarDots size={18} weight="bold" />
            </span>
            <span className={styles.memberIdentity}>
              <Typography as="span" size="sm" weight="semibold">
                Google Calendar
              </Typography>
              <Typography as="span" size="xs" color="muted">
                alex@acme.test
              </Typography>
            </span>
            <Badge variant="success">Connected</Badge>
            <Button variant="ghost" size="sm" onClick={() => setConnected(false)}>
              Disconnect
            </Button>
          </div>
        ) : (
          <div className={styles.calendarConnect}>
            <Button
              variant="primary"
              icon={<Plus size={14} weight="bold" />}
              onClick={() => setConnected(true)}
            >
              Connect a calendar
            </Button>
          </div>
        )}
      </section>

      {connected ? (
        <section className={styles.plainSection}>
          <div className={styles.panelHeader}>
            <Typography as="h3" size="lg" weight="semibold">
              Calendars on Acme
            </Typography>
          </div>
          <div className={styles.toggleList}>
            {calendars.map((calendar) => (
              <button
                className={styles.toggleRow}
                key={calendar.id}
                onClick={() => toggleCalendar(calendar.id)}
                type="button"
              >
                <span className={styles.calendarRowMain}>
                  <span
                    className={`${styles.calendarDot} ${styles[`color${calendar.color}`]}`}
                    aria-hidden="true"
                  />
                  <span className={styles.calendarRowText}>
                    <Typography as="span" size="sm" weight="semibold">
                      {calendar.name}
                    </Typography>
                    <Typography as="span" size="xs" color="muted">
                      {calendar.meta}
                    </Typography>
                  </span>
                </span>
                <span
                  className={calendar.on ? `${styles.switch} ${styles.switchOn}` : styles.switch}
                  aria-hidden="true"
                >
                  <span />
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {connected && syncedCount > 0 ? (
        <section className={styles.plainSection}>
          <div className={styles.panelHeader}>
            <Typography as="h3" size="lg" weight="semibold">
              On the Schedule
            </Typography>
          </div>
          <div className={styles.toggleList}>
            <ToggleRow
              title="Busy events reduce capacity"
              detail="Busy meetings count against open time."
              defaultOn
            />
            <ToggleRow title="Show free events" detail="Show free events on the Schedule." />
            <ToggleRow
              title="Hide event titles"
              detail="Show synced events as “Busy” instead of their title."
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

type SourceConnectionModalState =
  | { kind: 'account'; account: SourceAccount }
  | { kind: 'mapping'; unit: SourceUnit };

function WorkspaceConnectionsSection() {
  const [modal, setModal] = useState<SourceConnectionModalState | null>(null);

  return (
    <div className={styles.plainStack}>
      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Connected accounts
          </Typography>
        </div>
        <div className={styles.sourceConnectionList}>
          <div className={styles.sourceAccountHeader} aria-hidden="true">
            <span>Account</span>
            <span>Access</span>
            <span>Status</span>
            <span />
          </div>
          {sourceAccounts.map((account) => (
            <SourceConnectionAccountRow
              account={account}
              key={account.source}
              onOpen={() => setModal({ kind: 'account', account })}
            />
          ))}
        </div>
      </section>

      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Available source teams
          </Typography>
        </div>
        <table className={styles.sourceUnitTable}>
          <thead>
            <tr>
              <th scope="col">Source team</th>
              <th scope="col">Stride team</th>
              <th scope="col">Last synced</th>
              <th scope="col">
                <span className={styles.visuallyHidden}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sourceUnits.map((unit) => (
              <SourceConnectionUnitRow
                key={`${unit.source}-${unit.unit}`}
                onOpen={() => setModal({ kind: 'mapping', unit })}
                unit={unit}
              />
            ))}
          </tbody>
        </table>
      </section>

      {modal ? <SourceConnectionModal state={modal} onClose={() => setModal(null)} /> : null}
    </div>
  );
}

type SourceConnectionAccountRowProps = {
  account: SourceAccount;
  onOpen: () => void;
};

function SourceConnectionAccountRow({ account, onOpen }: SourceConnectionAccountRowProps) {
  return (
    <div className={styles.sourceConnectionRow}>
      <div className={styles.sourceRowPrimary}>
        <span className={styles.sourceMark}>{account.logo}</span>
        <span>
          <Typography as="span" size="sm" weight="semibold">
            {account.name}
          </Typography>
          <Typography as="span" size="xs" color="muted">
            {account.source}
          </Typography>
        </span>
      </div>
      <div className={styles.sourceConnectionMeta}>
        <Typography as="span" size="sm">
          {account.access}
        </Typography>
        <Typography as="span" size="xs" color="muted">
          {account.mapped}
        </Typography>
      </div>
      <Badge variant={account.statusVariant}>{account.status}</Badge>
      <button className={styles.sourceRowAction} onClick={onOpen} type="button">
        {account.action}
      </button>
    </div>
  );
}

type SourceConnectionUnitRowProps = {
  unit: SourceUnit;
  onOpen: () => void;
};

function SourceConnectionUnitRow({ unit, onOpen }: SourceConnectionUnitRowProps) {
  return (
    <tr>
      <td>
        <div className={styles.sourceUnitName}>
          <Typography as="span" size="sm" weight="semibold">
            {unit.unit}
          </Typography>
          <Typography as="span" size="xs" color="muted">
            {unit.source} {unit.type.toLowerCase()}
          </Typography>
        </div>
      </td>
      <td>
        {unit.strideTeam ? (
          <Typography as="span" size="sm" weight="semibold">
            {unit.strideTeam}
          </Typography>
        ) : (
          <Typography as="span" size="sm" color="muted">
            Not mapped
          </Typography>
        )}
      </td>
      <td>
        <Typography as="span" size="sm" color="muted">
          {unit.strideTeam ? '11m ago' : 'Never'}
        </Typography>
      </td>
      <td>
        <button className={styles.sourceRowAction} onClick={onOpen} type="button">
          {unit.strideTeam ? 'Configure' : 'Map'}
        </button>
      </td>
    </tr>
  );
}

type SourceConnectionModalProps = {
  state: SourceConnectionModalState;
  onClose: () => void;
};

function SourceConnectionModal({ state, onClose }: SourceConnectionModalProps) {
  const isAccount = state.kind === 'account';
  const [selectedTeam, setSelectedTeam] = useState(
    state.kind === 'mapping' ? (state.unit.strideTeam ?? 'unmapped') : 'unmapped'
  );
  const [importScope, setImportScope] = useState('open');
  const title = isAccount
    ? state.account.source === 'GitHub'
      ? 'Set up GitHub'
      : `Manage ${state.account.name}`
    : `${state.unit.unit} sync`;

  return (
    <div className={styles.sourceModalBackdrop} role="presentation" onClick={onClose}>
      <section
        aria-label={title}
        aria-modal="true"
        className={styles.sourceModal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className={styles.sourceModalHeader}>
          <div>
            <Typography as="h3" size="lg" weight="semibold">
              {title}
            </Typography>
          </div>
          <button className={styles.sourceModalClose} onClick={onClose} type="button">
            <X size={15} weight="bold" aria-hidden="true" />
          </button>
        </div>

        {isAccount ? (
          <div className={styles.sourceModalBody}>
            {state.account.source === 'GitHub' ? (
              <>
                <div className={styles.sourceModalSummary}>
                  <span className={styles.sourceMark}>{state.account.logo}</span>
                  <div>
                    <Typography as="p" size="base" weight="semibold">
                      GitHub App installation
                    </Typography>
                    <Typography as="p" size="sm" color="muted">
                      Install the workspace app before repositories can be mapped to Stride teams.
                    </Typography>
                  </div>
                  <Badge variant="neutral">Not installed</Badge>
                </div>
                <div className={styles.sourceSetupCard}>
                  <Typography as="p" size="sm" weight="semibold">
                    What Stride needs
                  </Typography>
                  <Typography as="p" size="sm" color="muted">
                    Repository metadata, issue links, pull request activity, and check results.
                    Members connect their own GitHub identity during onboarding.
                  </Typography>
                </div>
              </>
            ) : (
              <>
                <div className={styles.sourceModalSummary}>
                  <span className={styles.sourceMark}>{state.account.logo}</span>
                  <div>
                    <Typography as="p" size="base" weight="semibold">
                      {state.account.name}
                    </Typography>
                    <Typography as="p" size="sm" color="muted">
                      {state.account.owner}
                    </Typography>
                  </div>
                  <Badge variant={state.account.statusVariant}>{state.account.status}</Badge>
                </div>
                <div className={styles.sourceConnectionFacts}>
                  <div className={styles.sourceConnectionFact}>
                    <Typography as="span" size="xs" weight="semibold" color="muted">
                      Available
                    </Typography>
                    <Typography as="span" size="sm" weight="semibold">
                      {state.account.access}
                    </Typography>
                    <Typography as="span" size="xs" color="muted">
                      {state.account.mapped}
                    </Typography>
                  </div>
                  <div className={styles.sourceConnectionFact}>
                    <div className={styles.sourceConnectionFactHeader}>
                      <Typography as="span" size="xs" weight="semibold" color="muted">
                        Sync health
                      </Typography>
                      <button className={styles.sourceInlineAction} type="button">
                        Sync now
                      </button>
                    </div>
                    <Typography as="span" size="sm" weight="semibold">
                      Healthy
                    </Typography>
                    <Typography as="span" size="xs" color="muted">
                      Last synced {state.account.lastSynced}
                    </Typography>
                  </div>
                </div>
                <div className={styles.sourceDangerZone}>
                  <div>
                    <Typography as="p" size="sm" weight="semibold">
                      Disconnect account
                    </Typography>
                    <Typography as="p" size="sm" color="muted">
                      Stop future sync for this account. Existing Stride specs and sessions stay in
                      place until you delete them from your data.
                    </Typography>
                  </div>
                  <Button variant="danger" size="sm">
                    Disconnect
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={styles.sourceModalBody}>
            <div className={styles.sourceModalSummary}>
              <div>
                <Typography as="p" size="base" weight="semibold">
                  {state.unit.unit}
                </Typography>
                <Typography as="p" size="sm" color="muted">
                  {state.unit.source} {state.unit.type.toLowerCase()}
                </Typography>
              </div>
              <Badge variant={state.unit.strideTeam ? 'success' : 'neutral'}>
                {state.unit.strideTeam ? 'Mapped' : 'Not mapped'}
              </Badge>
            </div>

            <div className={styles.sourceSettingsGrid}>
              <div className={styles.sourceSelectField}>
                <Typography
                  as="label"
                  size="xs"
                  weight="semibold"
                  color="muted"
                  className={styles.fieldLabel}
                >
                  Stride team
                </Typography>
                <Select
                  label="Stride team"
                  hideTriggerLabel
                  value={selectedTeam}
                  onChange={setSelectedTeam}
                  options={[
                    { value: 'unmapped', label: 'Unmapped' },
                    { value: 'Platform', label: 'Platform' },
                    { value: 'App', label: 'App' },
                    { value: 'Infrastructure', label: 'Infrastructure' },
                  ]}
                />
              </div>

              <div className={styles.sourceSelectField}>
                <Typography
                  as="label"
                  size="xs"
                  weight="semibold"
                  color="muted"
                  className={styles.fieldLabel}
                >
                  Issue import
                </Typography>
                <Select
                  label="Issue import"
                  hideTriggerLabel
                  value={importScope}
                  onChange={setImportScope}
                  options={[
                    { value: 'open', label: 'Open issues' },
                    { value: 'assigned', label: 'Assigned issues only' },
                    { value: 'all', label: 'All issues' },
                  ]}
                />
              </div>

              <div className={styles.sourceMappingList}>
                <div>
                  <span>
                    <Typography as="span" size="sm" weight="semibold">
                      Status mapping
                    </Typography>
                    <Typography as="span" size="xs" color="muted">
                      4 source statuses mapped
                    </Typography>
                  </span>
                  <Button variant="secondary" size="sm">
                    Review
                  </Button>
                </div>
                <div>
                  <span>
                    <Typography as="span" size="sm" weight="semibold">
                      Priority mapping
                    </Typography>
                    <Typography as="span" size="xs" color="muted">
                      Uses source priority names
                    </Typography>
                  </span>
                  <Button variant="secondary" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.sourceModalFooter}>
          <Button
            variant="secondary"
            onClick={onClose}
            className={styles.sourceModalCancelButton}
          >
            {isAccount ? 'Close' : 'Cancel'}
          </Button>
          {isAccount && state.account.source !== 'GitHub' ? null : (
            <Button variant="primary" onClick={onClose}>
              {isAccount
                ? 'Install GitHub App'
                : state.unit.strideTeam
                  ? 'Save changes'
                  : 'Start sync'}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function TeamSourceSection() {
  const [source, setSource] = useState<'jira' | 'linear' | 'github'>('jira');
  const [entity, setEntity] = useState('jira-platform');
  const [cycleLabel, setCycleLabel] = useState('Sprint');
  const sourceUnitLabel = source === 'jira' ? 'Jira board' : source === 'linear' ? 'Linear team' : 'GitHub repository';
  const sourceUnitInfo =
    source === 'jira'
      ? 'Choose one board from the workspace Jira account to map to this Stride team.'
      : source === 'linear'
        ? 'Choose one team from the workspace Linear account to map to this Stride team.'
        : 'Choose one repository from the workspace GitHub organization to map to this Stride team. Multiple repositories per team is still an open product question.';
  const sourceUnitOptions =
    source === 'jira'
      ? [
          { value: 'jira-platform', label: 'Core Platform board' },
          { value: 'jira-mobile', label: 'Mobile App board' },
          { value: 'jira-growth-claimed', label: 'Growth Platform board (mapped)' },
        ]
      : source === 'linear'
        ? [
            { value: 'linear-product', label: 'Product team' },
            { value: 'linear-design', label: 'Design team' },
          ]
        : [
            { value: 'github-web', label: 'stride-web' },
            { value: 'github-api', label: 'stride-api' },
            { value: 'github-desktop-claimed', label: 'stride-desktop (mapped)' },
          ];
  const selectedEntity =
    source === 'jira'
      ? entity === 'jira-mobile'
        ? { type: 'Kanban board', cadence: 'Continuous flow' }
        : { type: 'Scrum board', cadence: '2 week sprint' }
      : source === 'linear'
        ? { type: 'Linear team', cadence: 'Cycle' }
        : { type: 'Repository', cadence: 'No cadence' };

  const updateSource = (value: string) => {
    const nextSource = value as 'jira' | 'linear' | 'github';

    setSource(nextSource);
    setEntity(
      nextSource === 'jira'
        ? 'jira-platform'
        : nextSource === 'linear'
          ? 'linear-product'
          : 'github-web'
    );
    setCycleLabel(nextSource === 'jira' ? 'Sprint' : nextSource === 'linear' ? 'Cycle' : 'None');
  };

  const updateEntity = (value: string) => {
    if (value.includes('claimed')) return;

    setEntity(value);
    setCycleLabel(value.includes('mobile') || value.includes('linear') ? 'Cycle' : 'Sprint');
  };

  return (
    <div className={styles.adminSurface}>
      <section className={styles.adminBlock}>
        <div className={styles.adminBlockHeader}>
          <Typography as="h3" size="base" weight="semibold">
            Source unit
          </Typography>
        </div>
        <div className={styles.adminFieldsWide}>
          <div className={styles.fieldGroup}>
            <Select
              label="Source type"
              hideTriggerLabel
              infoText="Each workspace can connect one Jira account, one Linear account, and one GitHub organization. This chooses which connected source this team maps from."
              value={source}
              onChange={updateSource}
              options={[
                { value: 'jira', label: 'Jira' },
                { value: 'linear', label: 'Linear' },
                { value: 'github', label: 'GitHub' },
              ]}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Select
              label={sourceUnitLabel}
              hideTriggerLabel
              infoText={sourceUnitInfo}
              value={entity}
              onChange={updateEntity}
              options={sourceUnitOptions}
            />
          </div>
        </div>
        <div className={styles.sourceFacts}>
          <div className={styles.sourceFactsInfo}>
            <Typography as="p" size="sm" weight="semibold">
              {selectedEntity.type}
            </Typography>
            <Typography as="p" size="sm" color="muted">
              Cadence from source: {selectedEntity.cadence}
            </Typography>
          </div>
          {source === 'github' ? null : (
            <Select
              label="Call it"
              value={cycleLabel}
              onChange={setCycleLabel}
              options={[
                { value: 'Sprint', label: 'Sprint' },
                { value: 'Cycle', label: 'Cycle' },
                { value: 'Iteration', label: 'Iteration' },
              ]}
            />
          )}
        </div>
      </section>

      <section className={styles.adminBlock}>
        <MappingTable
          title="Status"
          rows={[
            ['To Do', 'Needs breakdown'],
            ['Selected for Development', 'Ready'],
            ['In Progress', 'In flight'],
            ['Done', 'Closed'],
          ]}
        />
      </section>

      <section className={styles.adminBlock}>
        <MappingTable
          title="Priority"
          rows={[
            ['Highest', 'Urgent'],
            ['High', 'High'],
            ['Medium', 'Normal'],
            ['Low', 'Low'],
          ]}
        />
      </section>

      <section className={styles.adminBlock}>
        <MappingTable
          title="Difficulty"
          rows={[
            ['1 point', 'Tiny'],
            ['3 points', 'Small'],
            ['5 points', 'Medium'],
            ['8+ points', 'Large'],
          ]}
        />
      </section>
    </div>
  );
}

function TeamDefaultsSection() {
  const [newSpecDestination, setNewSpecDestination] = useState('needs-breakdown');
  const [triageOwner, setTriageOwner] = useState('team-admins');
  const [missingEstimates, setMissingEstimates] = useState('ask-during-breakdown');
  const [unassignedWork, setUnassignedWork] = useState('team-inbox');
  const [readyRule, setReadyRule] = useState('one-action');
  const [staleNudge, setStaleNudge] = useState('3-days');

  return (
    <div className={styles.adminSurface}>
      <section className={styles.adminBlock}>
        <div className={styles.adminFieldsWide}>
          <div className={styles.fieldGroup}>
            <Typography
              as="label"
              size="xs"
              weight="semibold"
              color="muted"
              className={styles.fieldLabel}
            >
              Team name
            </Typography>
            <TextInput defaultValue="Platform Engineering" />
          </div>
        </div>
      </section>

      <section className={styles.adminBlock}>
        <div className={styles.adminBlockHeader}>
          <Typography as="h3" size="base" weight="semibold">
            Workflow
          </Typography>
        </div>
        <div className={styles.adminFieldsWide}>
          <div className={styles.fieldGroup}>
            <Select
              label="New synced specs"
              hideTriggerLabel
              infoText="Where newly synced source issues land before anyone schedules them."
              value={newSpecDestination}
              onChange={setNewSpecDestination}
              options={[
                { value: 'needs-breakdown', label: 'Send to Needs breakdown' },
                { value: 'team-inbox', label: 'Send to team inbox' },
                { value: 'ready', label: 'Mark ready to schedule' },
              ]}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Select
              label="Triage owner"
              hideTriggerLabel
              infoText="Who is expected to decide whether a new spec is ready or needs breakdown."
              value={triageOwner}
              onChange={setTriageOwner}
              options={[
                { value: 'team-admins', label: 'Team admins' },
                { value: 'source-assignee', label: 'Source assignee' },
                { value: 'unassigned', label: 'Leave unassigned' },
              ]}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Select
              label="Missing estimates"
              hideTriggerLabel
              infoText="How Stride handles specs that arrive without size or time expectations."
              value={missingEstimates}
              onChange={setMissingEstimates}
              options={[
                { value: 'ask-during-breakdown', label: 'Ask during breakdown' },
                { value: 'allow-empty', label: 'Allow empty estimates' },
                { value: 'needs-review', label: 'Mark needs review' },
              ]}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Select
              label="Unassigned source work"
              hideTriggerLabel
              infoText="What to do with source issues that belong to the team but no person yet."
              value={unassignedWork}
              onChange={setUnassignedWork}
              options={[
                { value: 'team-inbox', label: 'Send to team inbox' },
                { value: 'needs-breakdown', label: 'Send to Needs breakdown' },
                { value: 'hide-until-assigned', label: 'Hide until assigned' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className={styles.adminBlock}>
        <div className={styles.adminBlockHeader}>
          <Typography as="h3" size="base" weight="semibold">
            Breakdown
          </Typography>
        </div>
        <div className={styles.adminFieldsWide}>
          <div className={styles.fieldGroup}>
            <Select
              label="Ready to schedule"
              hideTriggerLabel
              infoText="The rule Stride uses before moving a spec out of breakdown."
              value={readyRule}
              onChange={setReadyRule}
              options={[
                { value: 'one-action', label: 'Has at least one action' },
                { value: 'estimate-and-action', label: 'Has estimate and action' },
                { value: 'manual', label: 'Team admin marks ready' },
              ]}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Select
              label="Stale breakdown nudge"
              hideTriggerLabel
              infoText="When Stride should surface a spec that has sat in breakdown too long."
              value={staleNudge}
              onChange={setStaleNudge}
              options={[
                { value: 'off', label: 'Off' },
                { value: '3-days', label: 'After 3 workdays' },
                { value: '5-days', label: 'After 5 workdays' },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function AccountSection() {
  return (
    <div className={styles.plainStack}>
      <section className={styles.plainSection}>
        <div className={styles.profileAvatarRow}>
          <div className={styles.profileAvatarColumn}>
            <div className={styles.profileAvatar} aria-hidden="true">
              AJ
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={styles.profileAvatarEditButton}
              icon={<PencilSimple size={14} weight="bold" />}
            >
              Edit
            </Button>
          </div>
          <div className={styles.profileFields}>
            <div className={styles.fieldGroup}>
              <Typography
                as="label"
                size="xs"
                weight="semibold"
                color="muted"
                className={styles.fieldLabel}
              >
                First name
              </Typography>
              <TextInput defaultValue="Alex" />
            </div>
            <div className={styles.fieldGroup}>
              <Typography
                as="label"
                size="xs"
                weight="semibold"
                color="muted"
                className={styles.fieldLabel}
              >
                Last name
              </Typography>
              <TextInput defaultValue="Johnson" />
            </div>
            <div className={styles.fieldGroup}>
              <Typography
                as="label"
                size="xs"
                weight="semibold"
                color="muted"
                className={styles.fieldLabel}
              >
                Email
              </Typography>
              <TextInput type="email" defaultValue="alex@acme.test" />
            </div>
            <div className={styles.profilePasswordRow}>
              <Button variant="secondary" size="sm">
                Reset password
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.plainSection}>
        <div className={styles.panelHeader}>
          <Typography as="h3" size="lg" weight="semibold">
            Devices signed in to your account
          </Typography>
        </div>
        <div className={styles.securityList}>
          <SecuritySessionRow current name="This Mac" detail="Safari · Denver · active now" />
          <SecuritySessionRow name="Work laptop" detail="Chrome · last active yesterday" />
          <SecuritySessionRow name="Desktop tray" detail="Tauri app · last active 3 days ago" />
        </div>
      </section>
    </div>
  );
}

type ThemeOptionProps = {
  active: boolean;
  label: string;
  tone: 'dark' | 'light' | 'system';
  onSelect: () => void;
};

function ThemeMiniUi() {
  return (
    <span className={styles.themeMini}>
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function ThemeOption({ active, label, tone, onSelect }: ThemeOptionProps) {
  return (
    <button
      aria-pressed={active}
      className={active ? `${styles.themeOption} ${styles.themeOptionActive}` : styles.themeOption}
      onClick={onSelect}
      type="button"
    >
      <span className={styles.themePreview} aria-hidden="true">
        {tone === 'system' ? (
          <>
            <span className={`${styles.themeFace} ${styles.themeFacedark}`}>
              <ThemeMiniUi />
            </span>
            <span
              className={`${styles.themeFace} ${styles.themeFacelight} ${styles.themeFaceSplit}`}
            >
              <ThemeMiniUi />
            </span>
          </>
        ) : (
          <span className={`${styles.themeFace} ${styles[`themeFace${tone}`]}`}>
            <ThemeMiniUi />
          </span>
        )}
      </span>
      <Typography as="span" size="sm" weight="semibold">
        {label}
      </Typography>
    </button>
  );
}

type AccentSelectorProps = {
  accent: AccentColor;
  onChange: (accent: AccentColor) => void;
};

function AccentSelector({ accent, onChange }: AccentSelectorProps) {
  return (
    <div className={styles.accentGrid}>
      {accentOptions.map((option) => {
        const isActive = accent === option.value;

        return (
          <button
            aria-label={`${option.label} accent`}
            aria-pressed={isActive}
            className={[
              styles.accentOption,
              styles[`accentOption${option.value}`],
              isActive ? styles.accentOptionActive : null,
            ]
              .filter(Boolean)
              .join(' ')}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <span
              className={`${styles.accentSwatch} ${styles[`accentSwatch${option.value}`]}`}
              aria-hidden="true"
            />
            <Typography as="span" size="sm" weight="semibold" className={styles.accentLabel}>
              {option.label}
            </Typography>
            <span className={styles.accentRadio} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

type WorkModeOptionProps = {
  active: boolean;
  icon: ReactNode;
  label: string;
  summary: string;
  onSelect: () => void;
};

function WorkModeOption({ active, icon, label, summary, onSelect }: WorkModeOptionProps) {
  return (
    <button
      className={
        active ? `${styles.workModeCard} ${styles.workModeCardActive}` : styles.workModeCard
      }
      onClick={onSelect}
      type="button"
    >
      <span className={styles.workModeIcon}>{icon}</span>
      <span className={styles.workModeHeader}>
        <Typography as="span" size="base" weight="semibold">
          {label}
        </Typography>
      </span>
      <Typography as="span" size="sm" color="muted" className={styles.workModeSummary}>
        {summary}
      </Typography>
    </button>
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
    <button
      className={styles.toggleRow}
      onClick={() => setEnabled((value) => !value)}
      type="button"
    >
      <span>
        <Typography as="span" size="sm" weight="semibold">
          {title}
        </Typography>
        <Typography as="span" size="xs" color="muted" className={styles.optionDetail}>
          {detail}
        </Typography>
      </span>
      <span
        className={enabled ? `${styles.switch} ${styles.switchOn}` : styles.switch}
        aria-hidden="true"
      >
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
    .filter(
      ([name, value]) =>
        /^[A-Z]/.test(name) &&
        !['Icon', 'IconBase', 'IconContext', 'IconWeight'].includes(name) &&
        !name.endsWith('Context') &&
        !name.includes('Logo') &&
        typeof value === 'object' &&
        value !== null &&
        '$$typeof' in value
    )
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

const badgeColors = ['accent', 'success', 'warning', 'danger', 'violet', 'cyan', 'slate'] as const;

type BadgeColorDotProps = {
  color: string;
  onChange: (color: string) => void;
  triggerClassName?: string;
};

// A single colour swatch that opens a row of colour options. Used as the leading dot inside
// the text chip and as the corner dot on the icon badge.
function BadgeColorDot({ color, onChange, triggerClassName }: BadgeColorDotProps) {
  return (
    <Popover
      side="bottom"
      align="start"
      sideOffset={8}
      trigger={
        <span
          className={`${styles.badgeSwatchDot} ${styles[`color${color}`]}`}
          aria-label="Badge color"
        />
      }
      triggerClassName={triggerClassName}
      popupClassName={styles.badgeColorMenu}
    >
      {badgeColors.map((option) => (
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

type BadgeIconGlyphProps = {
  icon: string;
  color: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
};

// In icon mode the icon itself is the badge — a bare, coloured glyph. Clicking it opens one
// popover holding both the colour options and the icon search.
function BadgeIconGlyph({ icon, color, onIconChange, onColorChange }: BadgeIconGlyphProps) {
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(120);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const iconOptions = useMemo(() => allIconOptions.filter((option) => option.icon), []);
  const selected =
    iconOptions.find((option) => option.name === icon) ??
    iconOptions.find((option) => option.name === 'CheckCircle') ??
    null;
  const SelectedIcon = selected?.icon ?? CheckFallbackIcon;
  const normalizedQuery = query.toLowerCase().trim();
  const filteredOptions = useMemo(
    () => iconOptions.filter((option) => option.name.toLowerCase().includes(normalizedQuery)),
    [iconOptions, normalizedQuery]
  );
  const visibleOptions = filteredOptions.slice(0, visibleCount);
  const triggerClassName = [styles.badgeIconTrigger, styles[`editableBadge${color}`]]
    .filter(Boolean)
    .join(' ');

  return (
    <Popover
      side="bottom"
      align="start"
      sideOffset={8}
      trigger={<SelectedIcon size={22} weight="fill" aria-label="Badge icon and color" />}
      triggerClassName={triggerClassName}
      popupClassName={styles.badgeIconMenu}
    >
      <div className={styles.appearanceField}>
        <Typography
          as="span"
          size="xs"
          weight="semibold"
          color="muted"
          className={styles.fieldLabel}
        >
          Color
        </Typography>
        <div className={styles.appearanceColors}>
          {badgeColors.map((option) => (
            <button
              className={`${styles.colorSwatch} ${styles[`color${option}`]} ${color === option ? styles.colorSelected : ''}`}
              aria-label={option}
              key={option}
              onClick={() => onColorChange(option)}
              type="button"
            />
          ))}
        </div>
      </div>
      <div className={styles.appearanceField}>
        <Typography
          as="span"
          size="xs"
          weight="semibold"
          color="muted"
          className={styles.fieldLabel}
        >
          Icon
        </Typography>
        <TextInput
          placeholder="Search Phosphor icons"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(120);
          }}
        />
        <div
          className={styles.iconGrid}
          onScroll={(event) => {
            const target = event.currentTarget;
            const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 72;

            if (!nearBottom || isLoadingMore || visibleCount >= filteredOptions.length) return;

            setIsLoadingMore(true);
            window.requestAnimationFrame(() => {
              setVisibleCount((count) => Math.min(count + 96, filteredOptions.length));
              setIsLoadingMore(false);
            });
          }}
        >
          {visibleOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                className={
                  icon === option.name
                    ? `${styles.iconOption} ${styles.iconOptionActive}`
                    : styles.iconOption
                }
                key={option.name}
                onClick={() => onIconChange(option.name)}
                title={option.name}
                type="button"
              >
                <Icon size={17} weight="bold" aria-hidden />
              </button>
            );
          })}
        </div>
      </div>
    </Popover>
  );
}

type StatusAppearancePickerProps = {
  color: string;
  icon: string;
  onColorChange: (color: string) => void;
  onIconChange: (icon: string) => void;
};

function StatusAppearancePicker({
  color,
  icon,
  onColorChange,
  onIconChange,
}: StatusAppearancePickerProps) {
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(120);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const iconOptions = useMemo(() => allIconOptions.filter((option) => option.icon), []);
  const selected =
    iconOptions.find((option) => option.name === icon) ??
    iconOptions.find((option) => option.name === 'CheckCircle') ??
    null;
  const SelectedIcon = selected?.icon ?? CheckFallbackIcon;
  const normalizedQuery = query.toLowerCase().trim();
  const filteredOptions = useMemo(
    () => iconOptions.filter((option) => option.name.toLowerCase().includes(normalizedQuery)),
    [iconOptions, normalizedQuery]
  );
  const visibleOptions = filteredOptions.slice(0, visibleCount);

  return (
    <Popover
      side="bottom"
      align="start"
      sideOffset={6}
      trigger={
        <span
          className={`${styles.statusAvatar} ${styles[`statusAvatar${color}`]}`}
          aria-label="Status icon and color"
        >
          <SelectedIcon size={20} weight="fill" aria-hidden />
        </span>
      }
      triggerClassName={styles.statusAvatarTrigger}
      popupClassName={styles.appearanceMenu}
    >
      <div className={styles.appearanceField}>
        <Typography
          as="span"
          size="xs"
          weight="semibold"
          color="muted"
          className={styles.fieldLabel}
        >
          Color
        </Typography>
        <div className={styles.appearanceColors}>
          {badgeColors.map((option) => (
            <button
              className={`${styles.colorSwatch} ${styles[`color${option}`]} ${color === option ? styles.colorSelected : ''}`}
              aria-label={option}
              key={option}
              onClick={() => onColorChange(option)}
              type="button"
            />
          ))}
        </div>
      </div>
      <div className={styles.appearanceField}>
        <Typography
          as="span"
          size="xs"
          weight="semibold"
          color="muted"
          className={styles.fieldLabel}
        >
          Icon
        </Typography>
        <TextInput
          placeholder="Search Phosphor icons"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(120);
          }}
        />
        <div
          className={styles.iconGrid}
          onScroll={(event) => {
            const target = event.currentTarget;
            const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 72;

            if (!nearBottom || isLoadingMore || visibleCount >= filteredOptions.length) return;

            setIsLoadingMore(true);
            window.requestAnimationFrame(() => {
              setVisibleCount((count) => Math.min(count + 96, filteredOptions.length));
              setIsLoadingMore(false);
            });
          }}
        >
          {visibleOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                className={
                  icon === option.name
                    ? `${styles.iconOption} ${styles.iconOptionActive}`
                    : styles.iconOption
                }
                key={option.name}
                onClick={() => onIconChange(option.name)}
                title={option.name}
                type="button"
              >
                <Icon size={17} weight="bold" aria-hidden />
              </button>
            );
          })}
        </div>
      </div>
    </Popover>
  );
}

type SearchableSelectOption = SimpleOption & {
  meta?: string;
};

type SearchableSelectProps = {
  label: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
};

function SearchableSelect({ label, value, options, onChange }: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = options
    .filter(
      (option) =>
        normalizedQuery === '' ||
        option.label.toLowerCase().includes(normalizedQuery) ||
        option.value.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 80);

  return (
    <div className={styles.searchableSelect}>
      <Typography
        as="label"
        size="xs"
        weight="semibold"
        color="muted"
        className={styles.fieldLabel}
      >
        {label}
      </Typography>
      <Popover
        sideOffset={4}
        trigger={
          <>
            <span className={styles.searchableValue}>{selected?.label ?? value}</span>
            <CaretDown size={13} weight="bold" aria-hidden="true" />
          </>
        }
        triggerClassName={styles.searchableTrigger}
        popupClassName={styles.searchableMenu}
      >
        <TextInput
          placeholder="Search timezones"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={styles.searchableList}>
          {visibleOptions.map((option) => (
            <button
              className={
                option.value === value
                  ? `${styles.searchableOption} ${styles.searchableOptionActive}`
                  : styles.searchableOption
              }
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setQuery('');
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </Popover>
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
  value: string;
  options: PickerOption[];
  onSelect: (value: string) => void;
  icon?: ElementType;
  footer?: ReactNode;
};

function CompactPicker({ value, options, onSelect, icon: Icon, footer }: CompactPickerProps) {
  return (
    <Popover
      sideOffset={4}
      trigger={
        <>
          {Icon ? (
            <Icon size={14} weight="bold" aria-hidden="true" className={styles.scopeIcon} />
          ) : null}
          <span className={styles.scopeName}>{value}</span>
          <CaretDown size={12} aria-hidden="true" className={styles.scopeCaret} />
        </>
      }
      triggerClassName={styles.scopeButton}
      popupClassName={styles.scopeMenu}
    >
      {options.map((option) => (
        <button
          className={styles.scopeMenuItem}
          key={option.value}
          onClick={() => onSelect(option.value)}
          type="button"
        >
          <span className={styles.scopeMenuName}>{option.label}</span>
          <span className={styles.scopeMenuMeta}>{option.meta}</span>
        </button>
      ))}
      {footer ? (
        <>
          <span className={styles.scopeMenuDivider} aria-hidden="true" />
          {footer}
        </>
      ) : null}
    </Popover>
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
      <div className={styles.mappingTableHead}>
        <Typography as="h3" size="base" weight="semibold">
          {title}
        </Typography>
        <div className={styles.segmentedControl} role="group" aria-label={`${title} badge display`}>
          <button
            aria-pressed={display === 'text'}
            className={display === 'text' ? styles.segmentActive : undefined}
            onClick={() => setDisplay('text')}
            type="button"
          >
            Text
          </button>
          <button
            aria-pressed={display === 'icon'}
            className={display === 'icon' ? styles.segmentActive : undefined}
            onClick={() => setDisplay('icon')}
            type="button"
          >
            Icon
          </button>
        </div>
      </div>
      <div className={styles.mappingRows}>
        <div className={`${styles.mappingRow} ${styles.mappingRowHead}`}>
          <Typography
            as="span"
            size="xs"
            weight="semibold"
            color="muted"
            className={styles.fieldLabel}
          >
            Source
          </Typography>
          <span aria-hidden="true" />
          <Typography
            as="span"
            size="xs"
            weight="semibold"
            color="muted"
            className={styles.fieldLabel}
          >
            Stride
          </Typography>
        </div>
        {rows.map(([source, stride], index) => (
          <div className={styles.mappingRow} key={`${source}-${stride}`}>
            <MappingBadge label={source} index={index} display="text" />
            <ArrowRight
              size={15}
              weight="regular"
              aria-hidden="true"
              className={styles.mappingArrow}
            />
            <MappingBadge label={stride} index={index + 1} display={display} editable />
          </div>
        ))}
      </div>
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
  const [value, setValue] = useState(label);
  const [icon, setIcon] = useState('CheckCircle');
  const defaultColors = ['warning', 'accent', 'success', 'slate'];
  const [color, setColor] = useState(defaultColors[index % defaultColors.length] ?? 'accent');

  if (!editable) {
    return (
      <div className={styles.mappingBadgeCell}>
        <Badge variant="neutral">{label}</Badge>
      </div>
    );
  }

  const colorClass = styles[`editableBadge${color}`];

  if (display === 'icon') {
    return (
      <div className={`${styles.mappingBadgeCell} ${styles.mappingBadgeEditable}`}>
        <BadgeIconGlyph
          icon={icon}
          color={color}
          onIconChange={setIcon}
          onColorChange={setColor}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.mappingBadgeCell} ${styles.mappingBadgeEditable}`}>
      <span className={`${styles.editableBadge} ${colorClass}`}>
        <BadgeColorDot
          color={color}
          onChange={setColor}
          triggerClassName={styles.badgeAppearanceTrigger}
        />
        <input
          aria-label={`Edit ${label}`}
          maxLength={14}
          onChange={(event) => setValue(event.target.value)}
          value={value}
        />
      </span>
    </div>
  );
}

type MemberRowProps = {
  member: MemberRecord;
  onOpen: () => void;
};

type SecuritySessionRowProps = {
  name: string;
  detail: string;
  current?: boolean;
};

function SecuritySessionRow({ name, detail, current = false }: SecuritySessionRowProps) {
  return (
    <div className={styles.securitySessionRow}>
      <span className={styles.securityDeviceIcon} aria-hidden="true">
        <GearSix size={16} weight="bold" />
      </span>
      <span className={styles.memberIdentity}>
        <Typography as="span" size="sm" weight="semibold">
          {name}
        </Typography>
        <Typography as="span" size="xs" color="muted">
          {detail}
        </Typography>
      </span>
      {current ? <Badge variant="success">Current</Badge> : null}
      {!current ? (
        <Button variant="secondary" size="sm" className={styles.securitySignOutButton}>
          Sign out
        </Button>
      ) : null}
    </div>
  );
}

function MemberAccessModal({
  member,
  onClose,
  scope,
}: {
  member: MemberRecord;
  onClose: () => void;
  scope: 'workspace' | 'team';
}) {
  const [isWorkspaceAdmin, setIsWorkspaceAdmin] = useState(
    member.detail.includes('Workspace admin')
  );
  const initialTeams = [
    member.detail.includes('Platform') || scope === 'team' ? 'platform' : null,
    member.detail.includes('App') ? 'app' : null,
    member.detail.includes('Infrastructure') ? 'infra' : null,
  ].filter(Boolean) as string[];
  const [selectedTeams, setSelectedTeams] = useState<string[]>(initialTeams);
  const [teamRoles, setTeamRoles] = useState<Record<string, 'member' | 'teamAdmin'>>({
    platform: member.detail.includes('Team admin') || scope === 'team' ? 'teamAdmin' : 'member',
    app: 'member',
    infra: 'member',
  });
  const [teamRole, setTeamRole] = useState(
    member.detail.includes('Team admin') ? 'teamAdmin' : 'member'
  );
  const isWorkspaceScope = scope === 'workspace';
  const addableTeamOptions = teamOptions.filter((team) => !selectedTeams.includes(team.value));
  const addTeam = (teamId: string) => {
    if (!teamId || selectedTeams.includes(teamId)) return;
    setSelectedTeams((teams) => [...teams, teamId]);
    setTeamRoles((roles) => ({ ...roles, [teamId]: roles[teamId] ?? 'member' }));
  };
  const removeTeam = (teamId: string) => {
    setSelectedTeams((teams) => teams.filter((id) => id !== teamId));
  };
  const teamLabel = (teamId: string) =>
    teamOptions.find((team) => team.value === teamId)?.label ?? teamId;

  return (
    <div className={styles.sourceModalBackdrop} role="presentation" onClick={onClose}>
      <section
        aria-label={`Edit access for ${member.name}`}
        aria-modal="true"
        className={styles.sourceModal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className={styles.sourceModalHeader}>
          <div>
            <Typography as="h3" size="lg" weight="semibold">
              {isWorkspaceScope ? 'Edit workspace access' : 'Edit Platform access'}
            </Typography>
          </div>
          <button className={styles.sourceModalClose} onClick={onClose} type="button">
            <X size={15} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.sourceModalBody}>
          <div className={styles.memberAccessSummary}>
            <div className={styles.memberAvatar} aria-hidden="true">
              {member.name.charAt(0)}
            </div>
            <div>
              <Typography as="p" size="base" weight="semibold">
                {member.name}
              </Typography>
            </div>
          </div>

          {isWorkspaceScope ? (
            <div className={styles.sourceSettingsGrid}>
              <button
                aria-pressed={isWorkspaceAdmin}
                className={styles.memberPermissionToggle}
                onClick={() => setIsWorkspaceAdmin((value) => !value)}
                type="button"
              >
                <span>
                  <Typography as="span" size="sm" weight="semibold">
                    Workspace admin
                  </Typography>
                  <Typography as="span" size="xs" color="muted">
                    Can manage workspace settings, source connections, members, and teams.
                  </Typography>
                </span>
                <span
                  className={
                    isWorkspaceAdmin ? `${styles.switch} ${styles.switchOn}` : styles.switch
                  }
                  aria-hidden="true"
                >
                  <span />
                </span>
              </button>

              <div className={styles.sourceSelectField}>
                <Typography
                  as="label"
                  size="xs"
                  weight="semibold"
                  color="muted"
                  className={styles.fieldLabel}
                >
                  Add team membership
                </Typography>
                <Select
                  label="Add team membership"
                  hideTriggerLabel
                  value="add-team"
                  onChange={addTeam}
                  options={[{ value: 'add-team', label: 'Choose a team' }, ...addableTeamOptions]}
                />
              </div>

              {selectedTeams.length > 0 ? (
                <div className={styles.memberAccessTable}>
                  <div>
                    <Typography
                      as="span"
                      size="xs"
                      weight="semibold"
                      color="muted"
                      className={styles.fieldLabel}
                    >
                      Selected team
                    </Typography>
                    <Typography
                      as="span"
                      size="xs"
                      weight="semibold"
                      color="muted"
                      className={styles.fieldLabel}
                    >
                      Role
                    </Typography>
                    <span />
                  </div>
                  {selectedTeams.map((teamId) => (
                    <div key={teamId}>
                      <Typography as="span" size="sm" weight="semibold">
                        {teamLabel(teamId)}
                      </Typography>
                      <Select
                        label={`${teamLabel(teamId)} role`}
                        hideTriggerLabel
                        value={teamRoles[teamId] ?? 'member'}
                        onChange={(role) =>
                          setTeamRoles((roles) => ({
                            ...roles,
                            [teamId]: role as 'member' | 'teamAdmin',
                          }))
                        }
                        options={[
                          { value: 'member', label: 'Member' },
                          { value: 'teamAdmin', label: 'Team admin' },
                        ]}
                      />
                      <button
                        className={styles.memberRemoveTeamButton}
                        onClick={() => removeTeam(teamId)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.memberEmptyTeams}>
                  <Typography as="p" size="sm" weight="semibold">
                    No team memberships selected.
                  </Typography>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.sourceSettingsGrid}>
              <div className={styles.sourceSelectField}>
                <Typography
                  as="label"
                  size="xs"
                  weight="semibold"
                  color="muted"
                  className={styles.fieldLabel}
                >
                  Platform role
                </Typography>
                <Select
                  label="Platform role"
                  hideTriggerLabel
                  value={teamRole}
                  onChange={setTeamRole}
                  options={[
                    { value: 'member', label: 'Member' },
                    { value: 'teamAdmin', label: 'Team admin' },
                  ]}
                />
              </div>
              <div className={styles.mappingPreview}>
                <Typography as="p" size="sm" weight="semibold">
                  Team admins manage this team only.
                </Typography>
              </div>
            </div>
          )}
        </div>

        <div className={styles.sourceModalFooter}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onClose}>
            Save access
          </Button>
        </div>
      </section>
    </div>
  );
}

function InviteMemberModal({ state, onClose }: { state: InviteModalState; onClose: () => void }) {
  const [email, setEmail] = useState(state.initialEmail ?? '');
  const [existingMember, setExistingMember] = useState('sam');
  const [isWorkspaceAdmin, setIsWorkspaceAdmin] = useState(false);
  const [teamRole, setTeamRole] = useState<'member' | 'teamAdmin'>('member');
  const [inviteTeam, setInviteTeam] = useState('platform');
  const [selectedTeams, setSelectedTeams] = useState<string[]>(
    state.scope === 'team' ? ['platform'] : []
  );
  const [teamRoles, setTeamRoles] = useState<Record<string, 'member' | 'teamAdmin'>>({
    platform: 'member',
    app: 'member',
    infra: 'member',
  });
  const addableTeamOptions = teamOptions.filter((team) => !selectedTeams.includes(team.value));
  const addTeam = (teamId: string) => {
    if (!teamId || selectedTeams.includes(teamId)) return;
    setSelectedTeams((teams) => [...teams, teamId]);
  };
  const removeTeam = (teamId: string) => {
    setSelectedTeams((teams) => teams.filter((id) => id !== teamId));
  };
  const teamLabel = (teamId: string) =>
    teamOptions.find((team) => team.value === teamId)?.label ?? teamId;
  const title = state.scope === 'workspace' ? 'Invite to workspace' : 'Add Platform member';

  return (
    <div className={styles.sourceModalBackdrop} role="presentation" onClick={onClose}>
      <section
        aria-label={title}
        aria-modal="true"
        className={styles.sourceModal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className={styles.sourceModalHeader}>
          <div>
            <Typography as="h3" size="lg" weight="semibold">
              {title}
            </Typography>
          </div>
          <button className={styles.sourceModalClose} onClick={onClose} type="button">
            <X size={15} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.sourceModalBody}>
          {state.mode === 'existing' ? (
            <div className={styles.sourceSelectField}>
              <Typography
                as="label"
                size="xs"
                weight="semibold"
                color="muted"
                className={styles.fieldLabel}
              >
                Workspace member
              </Typography>
              <Select
                label="Workspace member"
                hideTriggerLabel
                value={existingMember}
                onChange={setExistingMember}
                options={[
                  { value: 'sam', label: 'Sam Patel' },
                  { value: 'nora', label: 'Nora Kim' },
                  { value: 'alex', label: 'Alex Rivera' },
                ]}
              />
            </div>
          ) : (
            <div className={styles.sourceSelectField}>
              <Typography
                as="label"
                size="xs"
                weight="semibold"
                color="muted"
                className={styles.fieldLabel}
              >
                Email
              </Typography>
              <TextInput
                placeholder="teammate@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          )}

          {state.scope === 'workspace' ? (
            <>
              <button
                aria-pressed={isWorkspaceAdmin}
                className={styles.memberPermissionToggle}
                onClick={() => setIsWorkspaceAdmin((value) => !value)}
                type="button"
              >
                <span>
                  <Typography as="span" size="sm" weight="semibold">
                    Workspace admin
                  </Typography>
                  <Typography as="span" size="xs" color="muted">
                    Can manage workspace settings, members, source connections, and teams.
                  </Typography>
                </span>
                <span
                  className={
                    isWorkspaceAdmin ? `${styles.switch} ${styles.switchOn}` : styles.switch
                  }
                  aria-hidden="true"
                >
                  <span />
                </span>
              </button>

              <div className={styles.sourceSelectField}>
                <Typography
                  as="label"
                  size="xs"
                  weight="semibold"
                  color="muted"
                  className={styles.fieldLabel}
                >
                  Add team membership
                </Typography>
                <Select
                  label="Add team membership"
                  hideTriggerLabel
                  value="add-team"
                  onChange={addTeam}
                  options={[{ value: 'add-team', label: 'Choose a team' }, ...addableTeamOptions]}
                />
              </div>

              {selectedTeams.length > 0 ? (
                <div className={styles.memberAccessTable}>
                  <div>
                    <Typography
                      as="span"
                      size="xs"
                      weight="semibold"
                      color="muted"
                      className={styles.fieldLabel}
                    >
                      Selected team
                    </Typography>
                    <Typography
                      as="span"
                      size="xs"
                      weight="semibold"
                      color="muted"
                      className={styles.fieldLabel}
                    >
                      Role
                    </Typography>
                    <span />
                  </div>
                  {selectedTeams.map((teamId) => (
                    <div key={teamId}>
                      <Typography as="span" size="sm" weight="semibold">
                        {teamLabel(teamId)}
                      </Typography>
                      <Select
                        label={`${teamLabel(teamId)} role`}
                        hideTriggerLabel
                        value={teamRoles[teamId] ?? 'member'}
                        onChange={(role) =>
                          setTeamRoles((roles) => ({
                            ...roles,
                            [teamId]: role as 'member' | 'teamAdmin',
                          }))
                        }
                        options={[
                          { value: 'member', label: 'Member' },
                          { value: 'teamAdmin', label: 'Team admin' },
                        ]}
                      />
                      <button
                        className={styles.memberRemoveTeamButton}
                        onClick={() => removeTeam(teamId)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.sourceSettingsGrid}>
              <div className={styles.sourceSelectField}>
                <Typography
                  as="label"
                  size="xs"
                  weight="semibold"
                  color="muted"
                  className={styles.fieldLabel}
                >
                  Team
                </Typography>
                <Select
                  label="Team"
                  hideTriggerLabel
                  value={inviteTeam}
                  onChange={setInviteTeam}
                  options={teamOptions}
                />
              </div>
              <div className={styles.sourceSelectField}>
                <Typography
                  as="label"
                  size="xs"
                  weight="semibold"
                  color="muted"
                  className={styles.fieldLabel}
                >
                  Role
                </Typography>
                <Select
                  label="Role"
                  hideTriggerLabel
                  value={teamRole}
                  onChange={(role) => setTeamRole(role as 'member' | 'teamAdmin')}
                  options={[
                    { value: 'member', label: 'Member' },
                    { value: 'teamAdmin', label: 'Team admin' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.sourceModalFooter}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onClose}>
            {state.scope === 'workspace' ? 'Send invite' : 'Add member'}
          </Button>
        </div>
      </section>
    </div>
  );
}

function MemberRow({ member, onOpen }: MemberRowProps) {
  return (
    <div className={styles.memberRow}>
      <div className={styles.memberAvatar} aria-hidden="true">
        {member.name.charAt(0)}
      </div>
      <div className={styles.memberIdentity}>
        <Typography as="p" size="sm" weight="semibold">
          {member.name}
        </Typography>
        <Typography as="p" size="xs" color="muted">
          {member.email}
        </Typography>
      </div>
      <Typography as="p" size="xs" color="muted" className={styles.memberRole}>
        {member.detail}
      </Typography>
      <Button variant="secondary" size="sm" onClick={onOpen}>
        Edit access
      </Button>
    </div>
  );
}
