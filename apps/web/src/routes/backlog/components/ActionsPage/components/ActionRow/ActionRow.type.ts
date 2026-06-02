import type { ActionScope, BacklogActionRow, BacklogView } from '../../../types';

export type ActionRowProps = {
  action: BacklogActionRow;
  scope: ActionScope;
  view: BacklogView;
};
