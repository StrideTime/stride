import type { ElementType } from 'react';

import {
  BellIcon,
  BriefcaseIcon,
  CalendarDotsIcon,
  DatabaseIcon,
  GearSixIcon,
  PaintBrushIcon,
  PlugIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SmileyIcon,
  UserIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';

export type SettingsSectionId =
  | 'my-workspace'
  | 'my-calendar'
  | 'my-notifications'
  | 'account'
  | 'appearance'
  | 'my-statuses'
  | 'your-data'
  | 'workspace-general'
  | 'workspace-connections'
  | 'workspace-members'
  | 'team-general'
  | 'team-members'
  | 'team-source';

export type Role = 'member' | 'teamAdmin' | 'workspaceAdmin';

export type WorkspaceOption = {
  id: string;
  name: string;
  plan: string;
  role: Role;
};

export type TeamOption = {
  id: string;
  name: string;
  source: string;
  role: Role;
};

export type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: ElementType;
};

export type SettingsGroup = {
  id: string;
  label: string;
  helper: string;
  sections: SettingsSection[];
  minimumRole?: Role;
};

export type MemberRecord = {
  name: string;
  email: string;
  detail: string;
};

export type TeamSelectOption = { value: string; label: string };

export const workspaceOptions: WorkspaceOption[] = [
  { id: 'acme', name: 'Acme', plan: 'Organization', role: 'workspaceAdmin' },
  { id: 'orbit', name: 'Orbit', plan: 'Organization', role: 'teamAdmin' },
  { id: 'personal', name: 'Personal', plan: 'Personal', role: 'member' },
];

export const teamsByWorkspace: Record<string, TeamOption[]> = {
  acme: [
    { id: 'platform', name: 'Platform', source: 'Acme Jira', role: 'teamAdmin' },
    { id: 'app', name: 'App', source: 'Linear Engineering', role: 'member' },
    { id: 'infra', name: 'Infrastructure', source: 'GitHub Org', role: 'workspaceAdmin' },
  ],
  orbit: [
    { id: 'product', name: 'Product', source: 'Linear Product', role: 'teamAdmin' },
    { id: 'design', name: 'Design', source: 'Not mapped', role: 'member' },
  ],
  personal: [{ id: 'personal', name: 'Personal', source: 'No source', role: 'member' }],
};

export const ROLE_RANK: Record<Role, number> = {
  member: 1,
  teamAdmin: 2,
  workspaceAdmin: 3,
};

export const settingsGroups: SettingsGroup[] = [
  {
    id: 'personal',
    label: 'Personal',
    helper: 'Account-wide settings across every workspace.',
    sections: [
      { id: 'account', label: 'Profile', description: '', icon: UserIcon },
      { id: 'appearance', label: 'Appearance', description: '', icon: PaintBrushIcon },
      { id: 'my-statuses', label: 'My statuses', description: '', icon: SmileyIcon },
    ],
  },
  {
    id: 'my-settings',
    label: 'My workspace settings',
    helper: 'Your defaults for Acme Platform.',
    sections: [
      { id: 'my-workspace', label: 'Work preferences', description: '', icon: SlidersHorizontalIcon },
      { id: 'my-calendar', label: 'Calendar', description: '', icon: CalendarDotsIcon },
      { id: 'my-notifications', label: 'Notifications', description: '', icon: BellIcon },
      { id: 'your-data', label: 'Privacy and data', description: '', icon: DatabaseIcon },
    ],
  },
  {
    id: 'workspace-admin',
    label: 'Workspace admin',
    helper: 'Visible to workspace admins only.',
    minimumRole: 'workspaceAdmin',
    sections: [
      { id: 'workspace-general', label: 'General', description: '', icon: BriefcaseIcon },
      { id: 'workspace-connections', label: 'Source connections', description: '', icon: PlugIcon },
      { id: 'workspace-members', label: 'Members', description: '', icon: UsersThreeIcon },
    ],
  },
  {
    id: 'team-admin',
    label: 'Team admin',
    helper: 'For the selected team inside this workspace.',
    minimumRole: 'teamAdmin',
    sections: [
      { id: 'team-general', label: 'General', description: '', icon: GearSixIcon },
      { id: 'team-members', label: 'Members', description: '', icon: UsersThreeIcon },
      { id: 'team-source', label: 'Source mapping', description: '', icon: ShieldCheckIcon },
    ],
  },
];

export const teamOptions: TeamSelectOption[] = [
  { value: 'platform', label: 'Platform' },
  { value: 'app', label: 'App' },
  { value: 'infra', label: 'Infrastructure' },
];

export const workspaceMemberRecords: MemberRecord[] = [
  { name: 'Jaren Lee', email: 'jaren@acme.test', detail: 'Workspace admin' },
  { name: 'Morgan Chen', email: 'morgan@acme.test', detail: 'Team admin · Platform' },
  { name: 'Sam Patel', email: 'sam@acme.test', detail: 'Member · App' },
  { name: 'Nora Kim', email: 'nora@acme.test', detail: 'Member · Infrastructure' },
];

export const teamMemberRecords: MemberRecord[] = [
  { name: 'Jaren Lee', email: 'jaren@acme.test', detail: 'Team admin' },
  { name: 'Morgan Chen', email: 'morgan@acme.test', detail: 'Team admin' },
  { name: 'Priya Shah', email: 'priya@acme.test', detail: 'Member' },
];

export type SimpleOption = {
  value: string;
  label: string;
};

export type AccentColor = 'blue' | 'violet' | 'cyan' | 'green' | 'amber';

export type WorkspaceCalendar = {
  id: string;
  name: string;
  meta: string;
  color: string;
  on: boolean;
};

export type SourceAccount = {
  source: 'Jira' | 'Linear' | 'GitHub';
  name: string;
  logo: string;
  status: string;
  statusVariant: 'neutral' | 'success';
  access: string;
  mapped: string;
  action: string;
  owner: string;
  lastSynced: string;
};

export type SourceUnit = {
  source: 'Jira' | 'Linear';
  unit: string;
  type: string;
  connection: string;
  strideTeam: string | null;
};

export const dayOptions: SimpleOption[] = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
];

export const fallbackTimeZones = [
  'UTC',
  'America/Denver',
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const accentOptions: { value: AccentColor; label: string }[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'violet', label: 'Violet' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'green', label: 'Green' },
  { value: 'amber', label: 'Amber' },
];

export const initialCalendars: WorkspaceCalendar[] = [
  { id: 'primary', name: 'alex@acme.test', meta: 'Primary', color: 'accent', on: true },
  { id: 'platform', name: 'Platform Team', meta: 'Shared', color: 'violet', on: true },
  { id: 'personal', name: 'Personal', meta: 'Private', color: 'success', on: false },
  { id: 'holidays', name: 'Holidays in United States', meta: 'Read-only', color: 'warning', on: false },
];

export const sourceAccounts: SourceAccount[] = [
  {
    source: 'Jira',
    name: 'Acme Jira',
    logo: 'J',
    status: 'Connected',
    statusVariant: 'success',
    access: '5 boards',
    mapped: '4 mapped',
    action: 'Manage',
    owner: 'Connected by Maya Chen',
    lastSynced: '11 minutes ago',
  },
  {
    source: 'Linear',
    name: 'Linear Engineering',
    logo: 'L',
    status: 'Connected',
    statusVariant: 'success',
    access: '4 teams',
    mapped: '2 mapped',
    action: 'Manage',
    owner: 'Connected by Luis Romero',
    lastSynced: '8 minutes ago',
  },
  {
    source: 'GitHub',
    name: 'Acme GitHub',
    logo: 'G',
    status: 'Needs install',
    statusVariant: 'neutral',
    access: 'Repository events and checks',
    mapped: 'Members link identity in onboarding',
    action: 'Set up',
    owner: 'Not connected',
    lastSynced: 'Never',
  },
];

export const sourceUnits: SourceUnit[] = [
  { source: 'Jira', unit: 'Core Platform', type: 'Board', connection: 'Acme Jira', strideTeam: 'Platform' },
  { source: 'Jira', unit: 'Mobile App', type: 'Board', connection: 'Acme Jira', strideTeam: null },
  { source: 'Linear', unit: 'Product', type: 'Team', connection: 'Linear Engineering', strideTeam: 'App' },
  { source: 'Linear', unit: 'Activation', type: 'Team', connection: 'Linear Engineering', strideTeam: null },
];
