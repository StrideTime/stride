import type { TFunction } from 'i18next';

import { AssigneeAvatar } from '../../../../components/AssigneeAvatar/AssigneeAvatar';
import type { FilterOption } from '../../../../types';

export function getAssigneeOptions(assignees: string[], t: TFunction): FilterOption[] {
  return [
    { value: 'all', label: t('backlog.filters.everyone') },
    { value: 'mine', label: t('backlog.filters.mine'), leading: <AssigneeAvatar name="You" /> },
    { value: 'unassigned', label: t('backlog.filters.unassigned'), leading: <AssigneeAvatar /> },
    ...assignees.map(assignee => ({
      value: assignee,
      label: assignee,
      leading: <AssigneeAvatar name={assignee} />,
    })),
  ];
}
