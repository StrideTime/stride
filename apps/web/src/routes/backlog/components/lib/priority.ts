import type { BacklogSpec } from '@providers';

export function getPriorityColorVar(spec: BacklogSpec) {
  if (spec.priority === 'P1') return 'var(--color-priority-p1-text)';
  if (spec.priority === 'P2') return 'var(--color-priority-p2-text)';
  if (spec.priority === 'P3') return 'var(--color-priority-p3-text)';
  return 'var(--color-priority-p4-text)';
}
