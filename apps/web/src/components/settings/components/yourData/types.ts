import type { ReactNode } from 'react';

export type DataCategory = 'sessions' | 'checkins' | 'captures';

export type DataTableRow = {
  id: string;
  cells: ReactNode[];
  confirmText: string;
  deleteLabel: string;
};
