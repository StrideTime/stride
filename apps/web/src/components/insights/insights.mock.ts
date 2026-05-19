export type WorkspaceRole = 'member' | 'team-admin' | 'workspace-admin';

export type InsightScope = 'me' | 'projects' | 'team' | 'org';

export type RoleOption = {
  role: WorkspaceRole;
  label: string;
};

export type ScopeMeta = {
  scope: InsightScope;
  label: string;
  subtitle: string;
  minRoleRank: number;
};

// Roles are additive: Member is a subset of Team Admin is a subset of
// Workspace Admin. A scope is visible when the viewer's rank meets its minimum.
export const ROLE_RANK: Record<WorkspaceRole, number> = {
  member: 0,
  'team-admin': 1,
  'workspace-admin': 2,
};

// Dev-only stand-in until Better Auth and memberships land. It lets you preview
// which scopes each role can see; real auth will replace it with the session.
export const ROLE_OPTIONS: RoleOption[] = [
  { role: 'member', label: 'Member' },
  { role: 'team-admin', label: 'Team Admin' },
  { role: 'workspace-admin', label: 'Workspace Admin' },
];

export const SCOPE_META: ScopeMeta[] = [
  { scope: 'me', label: 'Me', subtitle: 'Your week and momentum', minRoleRank: 0 },
  { scope: 'projects', label: 'Projects', subtitle: 'Progress of your projects', minRoleRank: 0 },
  { scope: 'team', label: 'Team', subtitle: 'Aggregate team flow', minRoleRank: 1 },
  { scope: 'org', label: 'Org', subtitle: 'Initiative portfolio', minRoleRank: 2 },
];

// --- Me scope ---------------------------------------------------------------

export type DeltaDirection = 'up' | 'flat';

export type MeStat = {
  label: string;
  value: string;
  delta: string;
  direction: DeltaDirection;
};

export type FinishedItem = {
  id: string;
  sourceKey: string;
  title: string;
  kind: string;
  day: string;
  timeLogged: string;
};

export type MePattern = {
  title: string;
  detail: string;
};

export type MeSuggestion = {
  title: string;
  detail: string;
  action: string;
};

export type MeWeek = {
  id: string;
  label: string;
  isCurrent: boolean;
  stats: MeStat[];
  patterns: MePattern[];
  // Day-level detail and forward-looking suggestions only exist for the
  // current week; past weeks are presented as aggregate totals.
  finished?: FinishedItem[];
  suggestions?: MeSuggestion[];
};

// Weeks are ordered newest-first: index 0 is the current week.
export const meWeeks: MeWeek[] = [
  {
    id: 'week-2026-05-11',
    label: 'Week of May 11',
    isCurrent: true,
    stats: [
      { label: 'Focus time', value: '12h 40m', delta: '+3h 10m', direction: 'up' },
      { label: 'Specs closed', value: '4', delta: '+1', direction: 'up' },
      { label: 'Actions completed', value: '19', delta: '+4', direction: 'up' },
      { label: 'Focus streak', value: '3 weeks', delta: 'unbroken', direction: 'flat' },
    ],
    finished: [
      {
        id: 'fin-1',
        sourceKey: 'STR-118',
        title: 'Billing webhook retries',
        kind: 'Spec',
        day: 'Mon',
        timeLogged: '3h 05m',
      },
      {
        id: 'fin-2',
        sourceKey: 'STR-124',
        title: 'Source status mapping UI',
        kind: 'Spec',
        day: 'Tue',
        timeLogged: '4h 40m',
      },
      {
        id: 'fin-3',
        sourceKey: '',
        title: 'Review the Q3 planning doc',
        kind: 'Personal task',
        day: 'Wed',
        timeLogged: '45m',
      },
      {
        id: 'fin-4',
        sourceKey: 'STR-130',
        title: 'Schedule drag snapping',
        kind: 'Spec',
        day: 'Thu',
        timeLogged: '2h 15m',
      },
      {
        id: 'fin-5',
        sourceKey: 'STR-131',
        title: 'Inbox empty states',
        kind: 'Spec',
        day: 'Fri',
        timeLogged: '1h 30m',
      },
    ],
    patterns: [
      {
        title: 'Mornings are your strongest window',
        detail: 'Sessions started before noon run closest to their estimate.',
      },
      {
        title: 'Estimates are tightening',
        detail: 'Closed actions averaged 1.1× estimate this week, down from 1.5× a month ago.',
      },
      {
        title: 'Focus blocks are getting longer',
        detail: 'Your average uninterrupted block grew from 38m to 1h 12m.',
      },
    ],
    suggestions: [
      {
        title: 'Split the OAuth callback action',
        detail: 'It is estimated at 6h; your recent actions have been landing closer to 2h.',
        action: 'Break down STR-142',
      },
      {
        title: 'Two ready actions are unscheduled',
        detail: 'Billing QA work is estimated and unblocked but not on the calendar this week.',
        action: 'Open Schedule',
      },
    ],
  },
  {
    id: 'week-2026-05-04',
    label: 'Week of May 4',
    isCurrent: false,
    stats: [
      { label: 'Focus time', value: '9h 30m', delta: '+1h 05m', direction: 'up' },
      { label: 'Specs closed', value: '3', delta: 'same', direction: 'flat' },
      { label: 'Actions completed', value: '15', delta: '+2', direction: 'up' },
      { label: 'Focus streak', value: '2 weeks', delta: 'unbroken', direction: 'flat' },
    ],
    patterns: [
      {
        title: 'A strong finish on Thursday',
        detail: 'Over half the week’s focus time landed in the last two days.',
      },
      {
        title: 'Estimates ran long',
        detail: 'Closed actions averaged 1.5× estimate, mostly on the source-mapping work.',
      },
    ],
  },
  {
    id: 'week-2026-04-27',
    label: 'Week of Apr 27',
    isCurrent: false,
    stats: [
      { label: 'Focus time', value: '8h 25m', delta: 'baseline', direction: 'flat' },
      { label: 'Specs closed', value: '3', delta: 'baseline', direction: 'flat' },
      { label: 'Actions completed', value: '13', delta: 'baseline', direction: 'flat' },
      { label: 'Focus streak', value: '1 week', delta: 'started', direction: 'flat' },
    ],
    patterns: [
      {
        title: 'A lighter week with frequent context switches',
        detail: 'Focus blocks averaged 38m — the shortest of the month.',
      },
      {
        title: 'Meetings clustered on Wednesday',
        detail: 'Wednesday logged the least focus time of any day.',
      },
    ],
  },
];
