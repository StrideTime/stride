import type { ActionScope, BacklogView } from '../../../../types';
import styles from '../ActionRow.module.css';

export function getActionRowClass(scope: ActionScope, view: BacklogView) {
  if (view === 'completed' && scope === 'team') {
    return `${styles.actionRowTeamCompleted} ${styles.completedRow}`;
  }
  if (view === 'completed') return `${styles.actionRowCompleted} ${styles.completedRow}`;
  return scope === 'team' ? styles.actionRowTeam : styles.actionRow;
}
