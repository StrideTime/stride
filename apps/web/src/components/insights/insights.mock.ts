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
  { scope: 'team', label: 'Team', subtitle: 'Aggregate team flow', minRoleRank: 0 },
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

// --- Projects scope ---------------------------------------------------------
//
// Everything here is project-level and aggregate. No field is keyed to an
// individual, so the same data shape is safe for a Member, a Team Admin, and a
// Workspace Admin. The viewer's role only changes how many projects appear,
// never the granularity (a Member preview still sees their whole team).

export type ProjectHealth = 'on-track' | 'watch' | 'at-risk';

export type ProjectSource = 'Jira' | 'Linear' | 'GitHub';

export type ProjectAtRisk = {
  sourceKey: string;
  title: string;
  reason: string;
};

export type ProjectInsight = {
  id: string;
  name: string;
  source: ProjectSource;
  health: ProjectHealth;
  takeaway: string;
  specsClosed: number;
  specsOpen: number;
  blocked: number;
  estAccuracy: number;
  // Specs closed per week over the trailing 8 weeks. Drives the trend chart.
  pace: number[];
  atRisk: ProjectAtRisk[];
};

// Trailing 8-week window the closure-pace chart is labelled against.
export const PROJECT_TREND_WEEKS = [
  'Mar 23',
  'Mar 30',
  'Apr 6',
  'Apr 13',
  'Apr 20',
  'Apr 27',
  'May 4',
  'May 11',
] as const;

export const projects: ProjectInsight[] = [
  {
    id: 'proj-billing',
    name: 'Billing & Payments',
    source: 'Jira',
    health: 'on-track',
    takeaway: 'Billing closes work faster than it takes it on, with no blockers.',
    specsClosed: 11,
    specsOpen: 6,
    blocked: 0,
    estAccuracy: 88,
    pace: [1, 2, 1, 2, 2, 3, 2, 3],
    atRisk: [],
  },
  {
    id: 'proj-scheduling',
    name: 'Scheduling',
    source: 'Jira',
    health: 'on-track',
    takeaway: 'Scheduling holds a steady pace; one blocker is already being cleared.',
    specsClosed: 9,
    specsOpen: 7,
    blocked: 1,
    estAccuracy: 82,
    pace: [2, 1, 2, 1, 2, 2, 3, 2],
    atRisk: [
      {
        sourceKey: 'SCH-44',
        title: 'Drag snapping on touch',
        reason: 'Blocked on a Tauri input fix.',
      },
    ],
  },
  {
    id: 'proj-sync',
    name: 'Source Sync',
    source: 'Jira',
    health: 'watch',
    takeaway: 'Source Sync slowed through mid-April and has work outpacing closure.',
    specsClosed: 6,
    specsOpen: 9,
    blocked: 2,
    estAccuracy: 71,
    pace: [1, 1, 2, 0, 1, 1, 1, 2],
    atRisk: [
      {
        sourceKey: 'SYNC-22',
        title: 'Linear webhook backfill',
        reason: 'Estimate is roughly 3x recent actuals.',
      },
    ],
  },
  {
    id: 'proj-onboarding',
    name: 'Onboarding',
    source: 'GitHub',
    health: 'watch',
    takeaway: 'Onboarding is taking on more than it closes, with ready work unscheduled.',
    specsClosed: 4,
    specsOpen: 8,
    blocked: 1,
    estAccuracy: 76,
    pace: [0, 1, 1, 1, 0, 1, 1, 1],
    atRisk: [
      {
        sourceKey: 'ONB-9',
        title: 'First-sync project picker',
        reason: 'Unestimated and not on the calendar.',
      },
    ],
  },
  {
    id: 'proj-insights',
    name: 'Insights & Reporting',
    source: 'Linear',
    health: 'at-risk',
    takeaway: 'Insights carries the most blocked work of any project and has stalled.',
    specsClosed: 3,
    specsOpen: 12,
    blocked: 4,
    estAccuracy: 64,
    pace: [1, 0, 1, 0, 1, 0, 1, 1],
    atRisk: [
      {
        sourceKey: 'INS-31',
        title: 'Org rollup query',
        reason: 'Blocked 9 days on a schema change.',
      },
      {
        sourceKey: 'INS-37',
        title: 'Chart interaction spec',
        reason: 'No actions broken down yet.',
      },
    ],
  },
  {
    id: 'proj-mobile',
    name: 'Mobile Shell',
    source: 'Linear',
    health: 'at-risk',
    takeaway: 'Mobile Shell estimates run far over actuals and closure has stalled.',
    specsClosed: 2,
    specsOpen: 10,
    blocked: 3,
    estAccuracy: 58,
    pace: [0, 1, 0, 1, 0, 0, 1, 0],
    atRisk: [
      {
        sourceKey: 'MOB-5',
        title: 'Expo navigation shell',
        reason: 'Estimate is about 2x recent actuals.',
      },
    ],
  },
];

export const HEALTH_META: Record<ProjectHealth, { label: string }> = {
  'at-risk': { label: 'At risk' },
  watch: { label: 'Watch' },
  'on-track': { label: 'On track' },
};

// --- Team scope -------------------------------------------------------------
//
// Every team field is aggregate — by pipeline stage, by area, or by spec. No
// field is keyed to a person, so the same data is safe for a Member and a Team
// Admin. Role only adds the planning/coverage lanes (`coverage`,
// `planningQuality`, `suggestions`) that a Member cannot act on.
//
// `direction` means "positive movement", not "the number went up": a variance
// of 1.1x improving from 1.5x is `up`, because tighter estimates are better.

export type TeamVariant = 'flow' | 'pulse' | 'brief';

export type TeamVariantMeta = {
  variant: TeamVariant;
  label: string;
  blurb: string;
};

export const TEAM_VARIANTS: TeamVariantMeta[] = [
  { variant: 'flow', label: 'Flow', blurb: 'Pipeline and where work stalls' },
  { variant: 'pulse', label: 'Pulse', blurb: 'Rhythm and momentum' },
  { variant: 'brief', label: 'Brief', blurb: 'A written weekly readout' },
];

export type TeamStat = {
  label: string;
  value: string;
  delta: string;
  direction: DeltaDirection;
};

export type TeamPipelineStage = {
  label: string;
  count: number;
  delta: string;
  direction: DeltaDirection;
};

export type TeamArea = {
  name: string;
  specsClosed: number;
  focusHours: number;
};

export type TeamStall = {
  sourceKey: string;
  title: string;
  idleDays: number;
  reason: string;
};

export type TeamQuietArea = {
  name: string;
  detail: string;
};

export type TeamCoverage = {
  area: string;
  plannedHours: number;
  capacityHours: number;
};

export type TeamSuggestion = {
  title: string;
  detail: string;
  action: string;
};

export type TeamInsight = {
  weekLabel: string;
  // Variant-specific opening lines.
  flowTakeaway: string;
  pulseTakeaway: string;
  brief: string;
  pipeline: TeamPipelineStage[];
  stats: TeamStat[];
  // Trailing 8-week series, labelled by PROJECT_TREND_WEEKS.
  closureTrend: number[];
  focusTrend: number[];
  areas: TeamArea[];
  stalls: TeamStall[];
  quiet: TeamQuietArea[];
  patterns: MePattern[];
  // Team Admin only — the planning lanes.
  coverage: TeamCoverage[];
  planningQuality: TeamStat[];
  suggestions: TeamSuggestion[];
};

export const teamInsight: TeamInsight = {
  weekLabel: 'Week of May 11',
  flowTakeaway:
    'Engineering shipped 12 specs across 5 areas. Flow is steady; two stalled specs in Sync and Insights are the only drag on the pipeline.',
  pulseTakeaway:
    'A steady, focused week. The team’s strongest window has been mornings before standup, and Billing is shipping at its highest pace of the quarter.',
  brief:
    'The team closed 12 specs this week across Billing, Scheduling, Insights, Onboarding, and Sync — a steady pace, up 3 from last week. Two specs have been idle for over a week, both waiting on outside review. Mornings before standup remain the strongest shipping window.',
  pipeline: [
    { label: 'Inbox', count: 7, delta: '+2 vs last wk', direction: 'flat' },
    { label: 'Ready', count: 14, delta: '−3 vs last wk', direction: 'flat' },
    { label: 'In flight', count: 9, delta: 'same', direction: 'flat' },
    { label: 'Closed', count: 12, delta: '+4 vs last wk', direction: 'up' },
  ],
  stats: [
    { label: 'Focus time', value: '148h', delta: '+18h vs 4-wk avg', direction: 'up' },
    { label: 'Specs closed', value: '12', delta: '+3 vs last week', direction: 'up' },
    { label: 'Actions completed', value: '87', delta: '+14 vs last week', direction: 'up' },
    { label: 'Estimate variance', value: '1.1×', delta: 'tightening from 1.5×', direction: 'up' },
  ],
  closureTrend: [6, 8, 7, 9, 8, 11, 8, 12],
  focusTrend: [96, 108, 102, 120, 116, 134, 130, 148],
  areas: [
    { name: 'Billing & Payments', specsClosed: 4, focusHours: 44 },
    { name: 'Scheduling', specsClosed: 3, focusHours: 38 },
    { name: 'Insights & Reporting', specsClosed: 2, focusHours: 28 },
    { name: 'Onboarding', specsClosed: 2, focusHours: 20 },
    { name: 'Source Sync', specsClosed: 1, focusHours: 18 },
  ],
  stalls: [
    {
      sourceKey: 'SYNC-22',
      title: 'Linear webhook backfill',
      idleDays: 9,
      reason: 'Waiting on review.',
    },
    {
      sourceKey: 'INS-31',
      title: 'Org rollup query',
      idleDays: 6,
      reason: 'Blocked on a schema change.',
    },
  ],
  quiet: [
    {
      name: 'Mobile Shell',
      detail:
        'No specs closed in 3 weeks. Fine if intentional, worth a check if not.',
    },
  ],
  patterns: [
    {
      title: 'Mornings before standup are the team’s strongest window',
      detail: 'Sessions started before 11am land closest to their estimate.',
    },
    {
      title: 'Closing pace is highest in Billing this month',
      detail: 'Billing has closed about 4 specs a week for three weeks running.',
    },
    {
      title: 'Two specs have stalled past a week',
      detail: 'SYNC-22 and INS-31 have not moved in 6+ days, both waiting on others.',
    },
  ],
  coverage: [
    { area: 'Billing & Payments', plannedHours: 22, capacityHours: 30 },
    { area: 'Scheduling', plannedHours: 28, capacityHours: 30 },
    { area: 'Source Sync', plannedHours: 12, capacityHours: 25 },
    { area: 'Insights & Reporting', plannedHours: 9, capacityHours: 20 },
    { area: 'Onboarding', plannedHours: 14, capacityHours: 22 },
  ],
  planningQuality: [
    { label: 'Estimate variance', value: '1.1×', delta: 'down from 1.5×', direction: 'up' },
    { label: 'Breakdown coverage', value: '78%', delta: '+6% vs last week', direction: 'up' },
    { label: 'Ready & unplanned', value: '7 specs', delta: '+2 vs last week', direction: 'flat' },
  ],
  suggestions: [
    {
      title: 'Coverage looks thin in Source Sync',
      detail: '7 ready specs are unscheduled; Sync and Onboarding have the most.',
      action: 'Open Schedule',
    },
    {
      title: 'Source Sync estimates run ~3× actuals',
      detail: 'A short breakdown session would tighten next sprint’s plan.',
      action: 'Open SYNC',
    },
    {
      title: 'SYNC-22 has been idle 9 days',
      detail: 'It is waiting on review — a nudge could clear it.',
      action: 'Nudge reviewer',
    },
  ],
};

// --- Org scope --------------------------------------------------------------
//
// Org insights are workspace-wide and visible to Workspace Admins only. Every
// field is initiative- or stage-level; nothing is keyed to a team or a person,
// so the surface never ranks teams or individuals. Three variants read the
// same quarter differently: Portfolio (what initiatives exist and their
// state), Forecast (whether committed work will land, and when), and Flow
// (whether delivery is healthy as a system).

export type OrgVariant = 'portfolio' | 'forecast' | 'flow';

export type OrgVariantMeta = {
  variant: OrgVariant;
  label: string;
  blurb: string;
};

export const ORG_VARIANTS: OrgVariantMeta[] = [
  { variant: 'portfolio', label: 'Portfolio', blurb: 'Initiatives and their state' },
  { variant: 'forecast', label: 'Forecast', blurb: 'Will committed work land' },
  { variant: 'flow', label: 'Flow health', blurb: 'Delivery as a system' },
];

export type OrgInitiative = {
  id: string;
  name: string;
  health: ProjectHealth;
  specsClosed: number;
  specsTotal: number;
  cycleTimeDays: number;
  forecastDate: string;
  note: string;
};

export type OrgStageLoad = {
  stage: string;
  count: number;
};

export type OrgAgingItem = {
  sourceKey: string;
  title: string;
  openDays: number;
  stage: string;
};

export type OrgInsight = {
  periodLabel: string;
  portfolioTakeaway: string;
  forecastTakeaway: string;
  flowTakeaway: string;
  // Each variant leads with its own four-stat block.
  portfolioStats: TeamStat[];
  forecastStats: TeamStat[];
  flowStats: TeamStat[];
  initiatives: OrgInitiative[];
  // Trailing 8-week series, labelled by PROJECT_TREND_WEEKS.
  closureBurnup: number[];
  cycleTrend: number[];
  stageLoad: OrgStageLoad[];
  agingWork: OrgAgingItem[];
  patterns: MePattern[];
};

export const orgInsight: OrgInsight = {
  periodLabel: 'Quarter to date',
  portfolioTakeaway:
    'Five initiatives are active. Three are on pace; Insights & Reporting and Mobile carry the risk and the longest cycle times.',
  forecastTakeaway:
    'At the current pace the workspace lands its committed work in early August — about two weeks past the quarter, driven by Mobile and Insights.',
  flowTakeaway:
    'Delivery is getting faster — median cycle time is down to 6.4 days — but Ready work is piling up faster than it is pulled into flight.',
  portfolioStats: [
    { label: 'Active initiatives', value: '5', delta: '+1 this quarter', direction: 'flat' },
    { label: 'Specs closed', value: '99', delta: '+18 vs last quarter', direction: 'up' },
    { label: 'Median cycle time', value: '6.4d', delta: 'down from 8.1d', direction: 'up' },
    { label: 'At-risk initiatives', value: '2', delta: 'same as last month', direction: 'flat' },
  ],
  forecastStats: [
    { label: 'Committed work', value: '168 specs', delta: '+18 since quarter start', direction: 'flat' },
    { label: 'Completed', value: '99 specs', delta: '59% of committed', direction: 'up' },
    { label: 'Projected finish', value: 'Aug 4', delta: '~2 weeks past quarter', direction: 'flat' },
    { label: 'Forecast confidence', value: 'Moderate', delta: 'scope grew twice', direction: 'flat' },
  ],
  flowStats: [
    { label: 'Median cycle time', value: '6.4d', delta: 'down from 8.1d', direction: 'up' },
    { label: 'Throughput', value: '12 / wk', delta: '+3 vs 8-wk avg', direction: 'up' },
    { label: 'Work in progress', value: '45 specs', delta: 'Ready + In flight', direction: 'flat' },
    { label: 'Aging past 14d', value: '5 specs', delta: '+1 vs last week', direction: 'flat' },
  ],
  initiatives: [
    {
      id: 'init-payments',
      name: 'Payments platform',
      health: 'on-track',
      specsClosed: 34,
      specsTotal: 41,
      cycleTimeDays: 4.2,
      forecastDate: 'May 30',
      note: 'Closing faster than it takes work on; no blocked specs.',
    },
    {
      id: 'init-scheduling',
      name: 'Scheduling & planning',
      health: 'on-track',
      specsClosed: 28,
      specsTotal: 38,
      cycleTimeDays: 5.1,
      forecastDate: 'Jun 13',
      note: 'Steady pace, cycle time holding flat.',
    },
    {
      id: 'init-integrations',
      name: 'Source integrations',
      health: 'watch',
      specsClosed: 19,
      specsTotal: 34,
      cycleTimeDays: 7.8,
      forecastDate: 'Jun 27',
      note: 'Cycle time up 40% this month — worth a check.',
    },
    {
      id: 'init-insights',
      name: 'Insights & Reporting',
      health: 'at-risk',
      specsClosed: 11,
      specsTotal: 29,
      cycleTimeDays: 11.4,
      forecastDate: 'Jul 18',
      note: 'Scope grew twice this quarter; closure lags the plan.',
    },
    {
      id: 'init-mobile',
      name: 'Mobile experience',
      health: 'at-risk',
      specsClosed: 7,
      specsTotal: 26,
      cycleTimeDays: 13.0,
      forecastDate: 'Aug 4',
      note: 'Estimates run ~2× actuals; closure stalled three weeks.',
    },
  ],
  closureBurnup: [12, 28, 41, 55, 68, 79, 90, 99],
  cycleTrend: [8.1, 7.6, 7.9, 7.0, 6.8, 6.5, 6.6, 6.4],
  stageLoad: [
    { stage: 'Inbox', count: 18 },
    { stage: 'Ready', count: 47 },
    { stage: 'In flight', count: 31 },
    { stage: 'In review', count: 14 },
  ],
  agingWork: [
    {
      sourceKey: 'INS-31',
      title: 'Org rollup query',
      openDays: 24,
      stage: 'In review',
    },
    {
      sourceKey: 'MOB-5',
      title: 'Expo navigation shell',
      openDays: 19,
      stage: 'In flight',
    },
    {
      sourceKey: 'SYNC-22',
      title: 'Linear webhook backfill',
      openDays: 16,
      stage: 'Blocked',
    },
  ],
  patterns: [
    {
      title: 'Cycle time is improving org-wide',
      detail: 'Median time from start to close fell from 8.1 to 6.4 days over the quarter.',
    },
    {
      title: 'Risk is concentrated, not spread',
      detail: 'Insights & Reporting and Mobile hold most of the open work on at-risk initiatives.',
    },
    {
      title: 'Ready work is outpacing pull into flight',
      detail: '47 specs are Ready but only ~12 enter flight each week — the queue ahead of execution is growing.',
    },
  ],
};
