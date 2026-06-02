import type { ActionScope, BacklogActionRow, BacklogView } from '../../../types';

export type ActionListProps = {
  actions: BacklogActionRow[];
  emptyText: string;
  scope: ActionScope;
  activeView: BacklogView;
  onScopeChange: (scope: ActionScope) => void;
};
