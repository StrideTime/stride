import type { ReactNode } from 'react';

import type { BacklogSpec } from './backlog.mock';

export type BacklogView =
  | 'all'
  | 'refine'
  | 'progress'
  | 'blocked'
  | 'next'
  | 'mine'
  | 'completed';

export type ActionScope = 'mine' | 'team';
export type AssigneeFilter = 'all' | 'mine' | 'unassigned' | string;

export type BacklogFilters = {
  query: string;
  assignee: AssigneeFilter;
  priority: 'all' | BacklogSpec['priority'];
  status: 'all' | string;
  attention: 'all' | BacklogSpec['attention'][number];
  readiness: 'all' | BacklogSpec['readiness'];
};

export type BacklogActionRow = BacklogSpec['actions'][number] & {
  spec: BacklogSpec;
  assignee: string;
  isBlocked: boolean;
  isMine: boolean;
};

export type FilterOption = {
  value: string;
  label: string;
  leading?: ReactNode;
};
