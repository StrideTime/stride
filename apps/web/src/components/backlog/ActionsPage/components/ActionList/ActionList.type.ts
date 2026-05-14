import type { ActionScope, BacklogActionRow, BacklogView } from '../../../types';

export type ActionListProps = {
  title: string;
  description: string;
  actions: BacklogActionRow[];
  emptyText: string;
  scope: ActionScope;
  activeView: BacklogView;
  onScopeChange: (scope: ActionScope) => void;
};
