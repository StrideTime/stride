export type StatusColor =
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'violet'
  | 'cyan'
  | 'slate';

export type ProfileStatus = {
  id: string;
  label: string;
  color: StatusColor;
  icon: string;
};

export type StoredStatusesState = {
  statuses: ProfileStatus[];
  currentStatusId: string;
};

export type StatusesContextValue = {
  statuses: ProfileStatus[];
  currentStatusId: string;
  currentStatus: ProfileStatus | null;
  setCurrentStatus: (id: string) => void;
  addStatus: () => string;
  updateStatus: (id: string, patch: Partial<Omit<ProfileStatus, 'id'>>) => void;
  removeStatus: (id: string) => void;
};
