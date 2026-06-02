import type { ProfileStatus, StatusColor, StoredStatusesState } from './types';

export const STATUSES_STORAGE_KEY = 'stride.statuses.v1';

function isStatusColor(value: unknown): value is StatusColor {
  return (
    value === 'accent' ||
    value === 'success' ||
    value === 'warning' ||
    value === 'danger' ||
    value === 'violet' ||
    value === 'cyan' ||
    value === 'slate'
  );
}

export function parseStoredStatuses(raw: string | null): StoredStatusesState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredStatusesState>;
    if (!Array.isArray(parsed.statuses)) return null;
    const statuses = parsed.statuses
      .filter(
        (entry): entry is ProfileStatus =>
          typeof entry?.id === 'string' &&
          typeof entry?.label === 'string' &&
          typeof entry?.icon === 'string' &&
          isStatusColor(entry?.color),
      )
      .map(entry => ({ id: entry.id, label: entry.label, color: entry.color, icon: entry.icon }));
    if (statuses.length === 0) return null;
    const currentStatusId = statuses.some(status => status.id === parsed.currentStatusId)
      ? parsed.currentStatusId!
      : statuses[0]!.id;
    return { statuses, currentStatusId };
  } catch {
    return null;
  }
}
