import type { ActionScope, BacklogView } from '../../../../types';
import styles from '../../../../../backlog.module.css';

export function getActionRowClass(scope: ActionScope, view: BacklogView) {
  if (view === 'completed' && scope === 'team') return styles.actionRowTeamCompleted;
  if (view === 'completed') return styles.actionRowCompleted;
  return scope === 'team' ? styles.actionRowTeam : styles.actionRow;
}
