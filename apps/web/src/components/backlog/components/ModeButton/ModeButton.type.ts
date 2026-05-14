import type { ReactNode } from 'react';

import type { BacklogView } from '../../types';

export type ModeButtonProps = {
  view: BacklogView;
  activeView: BacklogView;
  onViewChange: (view: BacklogView) => void;
  title: string;
  subtitle: string;
  icon?: ReactNode;
};
