import type { ActionScope, BacklogView } from '../../../../types';
import styles from '../ActionList.module.css';

export function getActionHeaderClass(scope: ActionScope, view: BacklogView) {
  if (view === 'completed' && scope === 'team') {
    return styles.actionListHeaderTeamCompleted;
  }
  if (view === 'completed') return styles.actionListHeaderCompleted;
  return scope === 'team' ? styles.actionListHeaderTeam : styles.actionListHeader;
}
