import { backlogSpecs, type BacklogSpec } from '../backlog.mock';
import type { ActionScope, BacklogActionRow, BacklogFilters, BacklogView } from '../types';

export const defaultBacklogFilters: BacklogFilters = {
  query: '',
  assignee: [],
  priority: [],
  status: [],
  attention: [],
  readiness: 'all',
};

export function getVisibleSpecs(view: BacklogView, filters: BacklogFilters) {
  return backlogSpecs
    .filter(spec => matchesView(spec, view))
    .filter(spec => matchesFilters(spec, filters));
}

export function getVisibleActions(
  view: BacklogView,
  scope: ActionScope,
  filters: BacklogFilters,
) {
  const rows = backlogSpecs.filter(spec => matchesFilters(spec, filters)).flatMap(spec =>
    spec.actions.map(action => {
      const assignee = action.assignee ?? spec.assignee ?? 'Unassigned';

      return {
        ...action,
        spec,
        assignee,
        isBlocked: spec.attention.includes('blocker-reported') || Boolean(spec.waitingOn),
        isMine: assignee === 'You',
      };
    }),
  );

  return rows
    .filter(action => scope === 'team' || action.isMine)
    .filter(action => {
      if (view === 'progress') return action.loggedMin > 0 && !action.done;
      if (view === 'blocked') return action.isBlocked && !action.done;
      if (view === 'completed') return Boolean(action.done);
      return !action.done && !action.isBlocked;
    })
    .sort(compareActionPriority);
}

export function getFilterOptions(kind: 'assignee' | 'priority' | 'status') {
  const values = backlogSpecs.flatMap(spec => {
    if (kind === 'assignee') {
      return [spec.assignee, ...spec.actions.map(action => action.assignee)].filter(
        Boolean,
      ) as string[];
    }
    if (kind === 'priority') return [spec.priority];
    return [spec.sourceStatus];
  });

  return Array.from(new Set(values)).sort();
}

export function getActiveFilterCount(filters: BacklogFilters) {
  return [
    filters.query.trim() ? filters.query : '',
    filters.assignee.length > 0 ? filters.assignee.join(',') : '',
    filters.priority.length > 0 ? filters.priority.join(',') : '',
    filters.status.length > 0 ? filters.status.join(',') : '',
    filters.attention.length > 0 ? filters.attention.join(',') : '',
    filters.readiness !== 'all' ? filters.readiness : '',
  ].filter(Boolean).length;
}

function matchesView(spec: BacklogSpec, view: BacklogView) {
  if (view === 'all') return true;
  if (view === 'refine') return spec.readiness !== 'ready';
  if (view === 'progress') return spec.actions.some(action => action.loggedMin > 0);
  if (view === 'next') return spec.readiness === 'ready' || spec.actions.length > 0;
  if (view === 'mine') {
    return spec.assignee === 'You' || spec.actions.some(action => action.assignee === 'You');
  }
  if (view === 'completed') {
    return spec.actions.length > 0 && spec.actions.every(action => action.done);
  }
  return (
    spec.attention.includes('blocker-reported') ||
    spec.attention.includes('closed-in-source') ||
    spec.attention.includes('awaiting-approval')
  );
}

function matchesFilters(spec: BacklogSpec, filters: BacklogFilters) {
  const assignee = spec.assignee ?? 'Unassigned';
  const query = filters.query.trim().toLowerCase();
  const searchableText = [
    spec.title,
    spec.sourceKey,
    spec.description,
    spec.source,
    spec.sourcePriority,
    spec.sourceStatus,
    spec.sprint,
    spec.team,
    ...spec.labels,
    ...spec.actions.map(action => action.title),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    (!query || searchableText.includes(query)) &&
    matchesAssignee(spec, filters.assignee) &&
    (filters.priority.length === 0 || filters.priority.includes(spec.priority)) &&
    (filters.status.length === 0 || filters.status.includes(spec.sourceStatus)) &&
    (filters.attention.length === 0 || filters.attention.some(attention => spec.attention.includes(attention))) &&
    (filters.readiness === 'all' || spec.readiness === filters.readiness) &&
    assignee.length > 0
  );
}

function matchesAssignee(spec: BacklogSpec, assigneeFilter: BacklogFilters['assignee']) {
  if (assigneeFilter.length === 0) return true;

  return assigneeFilter.some(assignee => {
    if (assignee === 'mine') {
      return spec.assignee === 'You' || spec.actions.some(action => action.assignee === 'You');
    }
    if (assignee === 'unassigned') {
      return !spec.assignee || spec.actions.some(action => !action.assignee);
    }
    return spec.assignee === assignee || spec.actions.some(action => action.assignee === assignee);
  });
}

function compareActionPriority(left: BacklogActionRow, right: BacklogActionRow) {
  const priorityOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
  const leftPlanned = left.scheduled ? 0 : 1;
  const rightPlanned = right.scheduled ? 0 : 1;
  const leftEstimate = left.estimateMin ?? 999;
  const rightEstimate = right.estimateMin ?? 999;

  return (
    priorityOrder[left.spec.priority] - priorityOrder[right.spec.priority] ||
    leftPlanned - rightPlanned ||
    leftEstimate - rightEstimate ||
    left.title.localeCompare(right.title)
  );
}
