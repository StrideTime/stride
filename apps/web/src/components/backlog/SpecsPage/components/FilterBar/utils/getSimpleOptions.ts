import type { TFunction } from 'i18next';

import type { FilterOption } from '../../../../types';

export function getSimpleOptions(defaultLabel: string, values: string[]): FilterOption[] {
  return [
    { value: 'all', label: defaultLabel },
    ...values.map(value => ({ value, label: value })),
  ];
}

export function getAttentionOptions(t: TFunction): FilterOption[] {
  return [
    { value: 'all', label: t('backlog.filters.anyAttention') },
    { value: 'blocker-reported', label: t('backlog.filters.blocked') },
    { value: 'awaiting-approval', label: t('backlog.filters.awaitingApproval') },
    { value: 'closed-in-source', label: t('backlog.filters.closedInSource') },
    { value: 'just-landed', label: t('backlog.filters.justLanded') },
    { value: 'unassigned', label: t('backlog.filters.unassigned') },
  ];
}
