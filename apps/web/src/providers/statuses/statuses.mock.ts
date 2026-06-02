import type { ProfileStatus } from '@providers';

export const defaultProfileStatuses: ProfileStatus[] = [
  { id: 'available', label: 'Available', color: 'success', icon: 'Smiley' },
  { id: 'focus', label: 'Focus', color: 'accent', icon: 'Target' },
  { id: 'away', label: 'Away', color: 'warning', icon: 'Coffee' },
];
