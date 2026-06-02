import type { TFunction } from 'i18next';

import type { BacklogActionRow } from '../../../../types';

export function getStatusPill(action: BacklogActionRow, t: TFunction) {
  if (action.done) return { label: t('backlog.statusPill.done'), variant: 'success' as const };
  if (action.isBlocked) return { label: t('backlog.statusPill.blocked'), variant: 'danger' as const };
  if (action.scheduled) return { label: t('backlog.statusPill.planned'), variant: 'warning' as const };
  return { label: t('backlog.statusPill.ready'), variant: 'success' as const };
}
