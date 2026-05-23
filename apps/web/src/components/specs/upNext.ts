import type { BacklogAction, BacklogSpec } from '../backlog/backlog.mock';

const PRIORITY_ORDER: Record<BacklogSpec['priority'], number> = {
  P1: 0,
  P2: 1,
  P3: 2,
  P4: 3,
};

export type UpNextAction = { spec: BacklogSpec; action: BacklogAction };

// Pick the most relevant Action for the user to work on right now: the
// highest-priority Spec that has an open Action assignable to "You".
export function pickUpNextAction(specs: BacklogSpec[]): UpNextAction | null {
  const ranked = [...specs].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );
  for (const spec of ranked) {
    const isMine = spec.assignee === 'You';
    const candidate = spec.actions.find(
      action => !action.done && (action.assignee === 'You' || (!action.assignee && isMine)),
    );
    if (candidate) return { spec, action: candidate };
  }
  return null;
}
