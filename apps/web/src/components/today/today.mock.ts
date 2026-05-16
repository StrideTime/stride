export type TodayAttentionItem = {
  id: string;
  label: string;
  title: string;
  detail: string;
  action: string;
  tone: 'warning' | 'danger' | 'accent';
};

export type TodayScheduleBlock = {
  id: string;
  time: string;
  title: string;
  detail: string;
  state: 'ready' | 'later' | 'meeting' | 'done' | 'break';
};

export type TodayPriorityAction = {
  id: string;
  sourceKey: string;
  title: string;
  estimate: string | null;
  actual: string;
  priority: string;
};

export const attentionItems: TodayAttentionItem[] = [
  {
    id: 'attn-1',
    label: 'Nudged',
    title: 'You are blocking Maya on OAuth handoff',
    detail: 'Waiting 1d · FE-42',
    action: 'Open spec',
    tone: 'danger',
  },
  {
    id: 'attn-2',
    label: 'Just assigned',
    title: 'Review Linear sync edge cases',
    detail: 'Assigned 18m ago · STR-108',
    action: 'Review',
    tone: 'accent',
  },
  {
    id: 'attn-3',
    label: 'Needs breakdown',
    title: 'Desktop capture window routing',
    detail: 'No actions yet · DE-17',
    action: 'Break down',
    tone: 'warning',
  },
];

export const scheduleBlocks: TodayScheduleBlock[] = [
  {
    id: 'sched-1',
    time: '8:45 AM',
    title: 'Morning review',
    detail: '15m · plan check',
    state: 'done',
  },
  {
    id: 'sched-2',
    time: '9:15 AM',
    title: 'Implement Today route variants',
    detail: '45m planned · ready to start',
    state: 'ready',
  },
  {
    id: 'sched-3',
    time: '10:15 AM',
    title: 'OAuth callback edge cases',
    detail: '50m · STR-112',
    state: 'later',
  },
  {
    id: 'sched-4',
    time: '11:30 AM',
    title: 'Design review with Sam',
    detail: 'Calendar · 30m',
    state: 'meeting',
  },
  {
    id: 'sched-5',
    time: '12:15 PM',
    title: 'Lunch',
    detail: 'Break · 45m',
    state: 'break',
  },
  {
    id: 'sched-6',
    time: '1:00 PM',
    title: 'Backlog filter polish',
    detail: '60m · FE-39',
    state: 'later',
  },
  {
    id: 'sched-7',
    time: '2:30 PM',
    title: 'Linear sync mapping',
    detail: '45m · LIN-88',
    state: 'later',
  },
  {
    id: 'sched-8',
    time: '3:30 PM',
    title: 'Source status mapping notes',
    detail: '30m · Jira/Linear',
    state: 'later',
  },
  {
    id: 'sched-9',
    time: '4:15 PM',
    title: 'End-session review copy',
    detail: '25m · polish',
    state: 'later',
  },
];

export const priorityActions: TodayPriorityAction[] = [
  {
    id: 'prio-1',
    sourceKey: 'STR-112',
    title: 'Add source drift conflict state',
    estimate: '50m',
    actual: '0m',
    priority: 'Highest',
  },
  {
    id: 'prio-2',
    sourceKey: 'FE-44',
    title: 'Wire empty-day state to Schedule',
    estimate: null,
    actual: '0m',
    priority: 'High',
  },
  {
    id: 'prio-3',
    sourceKey: 'LIN-88',
    title: 'Tighten session end review copy',
    estimate: '25m',
    actual: '10m',
    priority: 'High',
  },
];

export const todayStats = [
  { label: 'Focused today', value: '2h 15m' },
  { label: 'Sessions', value: '3' },
  { label: 'Done today', value: '2 actions' },
];
