import type { ReactNode } from 'react';

import type { BacklogView } from '../../types';

export type ControlsProps = {
  surface: 'specs' | 'actions';
  activeView: BacklogView;
  onViewChange: (view: BacklogView) => void;
};

export type BacklogMode = {
  view: BacklogView;
  title: string;
  subtitle: string;
  icon: ReactNode;
};
