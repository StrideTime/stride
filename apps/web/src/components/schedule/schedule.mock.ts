export type ScheduleMode = 'plan' | 'actual';

export type ScheduleEventType = 'session' | 'action' | 'meeting' | 'break' | 'focus' | 'personal' | 'buffer' | 'external' | 'research' | 'learning';

export type ScheduleEventTypeConfig = {
  id: ScheduleEventType;
  label: string;
  color: string;
  required?: boolean;
  archived?: boolean;
};

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export type RecurrenceRule = {
  frequency: RecurrenceFrequency;
  interval: number;
  ends: 'never' | 'onDate';
  endDate?: string;
};

export type ScheduleBlock = {
  id: string;
  date: string;
  title: string;
  type: ScheduleEventType;
  startMin: number;
  durationMin: number;
  actionId?: string;
  sourceKey?: string;
  source?: string;
  fixed?: boolean;
  recurring?: boolean;
  recurrence?: RecurrenceRule;
  description?: string;
  plannedMin?: number;
  actualMin?: number;
};

export type ScheduleAction = {
  id: string;
  title: string;
  sourceKey: string;
  specTitle?: string;
  priority: 'Highest' | 'High' | 'Medium' | 'Low';
  estimateMin: number;
  completedMin: number;
  futureScheduledMin: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const weekDays = [
  { date: '2026-05-17', label: 'Sun', dayNumber: '17', capacity: 'Off hours' },
  { date: '2026-05-18', label: 'Mon', dayNumber: '18', capacity: '4h 30m / 6h' },
  { date: '2026-05-19', label: 'Tue', dayNumber: '19', capacity: '5h / 6h' },
  { date: '2026-05-20', label: 'Wed', dayNumber: '20', capacity: '3h 15m / 5h' },
  { date: '2026-05-21', label: 'Thu', dayNumber: '21', capacity: '2h / 6h' },
  { date: '2026-05-22', label: 'Fri', dayNumber: '22', capacity: '4h / 5h' },
  { date: '2026-05-23', label: 'Sat', dayNumber: '23', capacity: 'Off hours' },
];

export const scheduleEventTypes: ScheduleEventTypeConfig[] = [
  { id: 'action', label: 'Actions', color: 'var(--color-accent)', required: true },
  { id: 'meeting', label: 'Meetings', color: 'var(--color-attention-warn-text)' },
  { id: 'focus', label: 'Focus', color: 'var(--color-success)' },
  { id: 'research', label: 'Research', color: 'oklch(76% 0.09 255)' },
  { id: 'learning', label: 'Learning', color: 'oklch(79% 0.1 205)' },
  { id: 'break', label: 'Breaks', color: 'var(--color-text-muted)' },
  { id: 'buffer', label: 'Buffers', color: 'oklch(70% 0.08 255)' },
  { id: 'personal', label: 'Personal', color: 'var(--color-text-muted)' },
  { id: 'external', label: 'Unclassified external', color: 'var(--color-text-muted)', archived: true },
  { id: 'session', label: 'Sessions', color: 'var(--color-accent)', archived: true },
];

export const plannedBlocks: ScheduleBlock[] = [
  { id: 'p1', date: '2026-05-18', title: 'OAuth callback edge cases', type: 'action', startMin: 540, durationMin: 75, actionId: 'a1', sourceKey: 'STR-108', description: 'Finish desktop callback handling and source-token edge cases.', plannedMin: 75, actualMin: 95 },
  { id: 'p2', date: '2026-05-18', title: 'Lunch', type: 'break', startMin: 720, durationMin: 45 },
  { id: 'p3', date: '2026-05-19', title: 'Weekly team sync', type: 'meeting', startMin: 600, durationMin: 30, source: 'Google Calendar', fixed: true, recurring: true, recurrence: { frequency: 'weekly', interval: 1, ends: 'never' }, description: 'Imported busy event from Google Calendar.' },
  { id: 'p4', date: '2026-05-19', title: 'Backlog filter polish', type: 'action', startMin: 660, durationMin: 60, actionId: 'a2', sourceKey: 'FE-44', description: 'Tighten filter defaults and empty state copy.', plannedMin: 60, actualMin: 45 },
  { id: 'p5', date: '2026-05-20', title: 'PR review window', type: 'focus', startMin: 810, durationMin: 60 },
  { id: 'p9', date: '2026-05-20', title: 'Calendar budget research', type: 'research', startMin: 900, durationMin: 60, description: 'Shape the first pass for category budgets.' },
  { id: 'p10', date: '2026-05-20', title: 'TanStack form notes', type: 'learning', startMin: 990, durationMin: 45 },
  { id: 'p11', date: '2026-05-20', title: 'Slack catch-up buffer', type: 'buffer', startMin: 1050, durationMin: 30 },
  { id: 'p6', date: '2026-05-21', title: 'Source status mapping notes', type: 'action', startMin: 570, durationMin: 45, actionId: 'a3', sourceKey: 'STR-91', description: 'Capture mapping decisions before implementation.', plannedMin: 45, actualMin: 30 },
  { id: 'p7', date: '2026-05-22', title: 'Buffer before planning review', type: 'buffer', startMin: 960, durationMin: 30 },
  { id: 'p8', date: '2026-05-22', title: 'Refine schedule empty state', type: 'action', startMin: 840, durationMin: 45, actionId: 'a6', sourceKey: 'FE-44', description: 'Make day-only assignments clear in week view.', plannedMin: 45, actualMin: 0 },
];

export const actualBlocks: ScheduleBlock[] = [
  { id: 's1', date: '2026-05-18', title: 'OAuth callback edge cases', type: 'session', startMin: 555, durationMin: 95, actionId: 'a1', sourceKey: 'STR-108' },
  { id: 's2', date: '2026-05-18', title: 'Linear mapping fix', type: 'session', startMin: 810, durationMin: 35, actionId: 'a4', sourceKey: 'STR-233' },
  { id: 's3', date: '2026-05-19', title: 'Backlog filter polish', type: 'session', startMin: 675, durationMin: 45, actionId: 'a2', sourceKey: 'FE-44' },
  { id: 's4', date: '2026-05-19', title: 'Source inbox triage', type: 'session', startMin: 720, durationMin: 30, actionId: 'a5', sourceKey: 'STR-112' },
  { id: 's6', date: '2026-05-20', title: 'PR review window', type: 'focus', startMin: 825, durationMin: 45 },
  { id: 's10', date: '2026-05-20', title: 'Calendar budget research', type: 'research', startMin: 900, durationMin: 60 },
  { id: 's11', date: '2026-05-20', title: 'TanStack form notes', type: 'learning', startMin: 990, durationMin: 30 },
  { id: 's7', date: '2026-05-20', title: 'Bug reproduction notes', type: 'session', startMin: 855, durationMin: 30, actionId: 'a6', sourceKey: 'FE-44' },
  { id: 's8', date: '2026-05-21', title: 'Source status mapping notes', type: 'session', startMin: 585, durationMin: 60, actionId: 'a3', sourceKey: 'STR-91' },
  { id: 's9', date: '2026-05-22', title: 'Planning review follow-up', type: 'session', startMin: 930, durationMin: 45 },
];

export const trayActions: ScheduleAction[] = [
  { id: 'a5', title: 'Add source drift conflict state', sourceKey: 'STR-112', specTitle: 'Source sync reliability', priority: 'Highest', estimateMin: 80, completedMin: 0, futureScheduledMin: 0, description: 'Surface source-side changes that conflict with local progress.', createdAt: '2026-05-15', updatedAt: '2026-05-16' },
  { id: 'a6', title: 'Wire empty-day state to Schedule', sourceKey: 'FE-44', specTitle: 'Schedule empty states', priority: 'High', estimateMin: 45, completedMin: 0, futureScheduledMin: 0, createdAt: '2026-05-14', updatedAt: '2026-05-14' },
  { id: 'a1', title: 'OAuth callback edge cases', sourceKey: 'STR-108', specTitle: 'Desktop auth integration', priority: 'High', estimateMin: 120, completedMin: 95, futureScheduledMin: 75, createdAt: '2026-05-10', updatedAt: '2026-05-15' },
  { id: 'a3', title: 'Source status mapping notes', sourceKey: 'STR-91', specTitle: 'Source status mapping', priority: 'Medium', estimateMin: 90, completedMin: 30, futureScheduledMin: 45, createdAt: '2026-05-08', updatedAt: '2026-05-13' },
];
