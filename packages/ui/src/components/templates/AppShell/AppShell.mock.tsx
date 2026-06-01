import {
  ClockCountdown,
  Coffee,
  House,
  ListBullets,
  Smiley,
  SquaresFour,
  Target,
  Tray,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';

export type NavItem = {
  to: string;
  label: string;
  icon: typeof House;
  badge?: number;
  children?: Array<{ href: string; label: string; icon: typeof House }>;
};

export type ShellStatus = {
  id: string;
  label: string;
  color: string;
  icon?: ReactNode;
};

export type Workspace = {
  mark: string;
  name: string;
  org: string;
  teams?: string[];
};

const showTrayPreview =
  ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false);

export const navItems: NavItem[] = [
  { to: '/', label: 'Today', icon: House },
  { to: '/inbox', label: 'Inbox', icon: Tray, badge: 3 },
  {
    to: '/backlog/specs',
    label: 'Backlog',
    icon: SquaresFour,
    badge: 7,
    children: [
      { href: '/backlog/specs', label: 'Specs', icon: SquaresFour },
      { href: '/backlog/actions', label: 'Actions', icon: ListBullets },
    ],
  },
  { to: '/schedule', label: 'Schedule', icon: ClockCountdown },
  ...(showTrayPreview ? [{ to: '/tray', label: 'Tray preview', icon: ClockCountdown }] : []),
];

export const defaultShellStatuses: ShellStatus[] = [
  {
    id: 'available',
    label: 'Available',
    color: 'success',
    icon: <Smiley size={18} weight="fill" aria-hidden="true" />,
  },
  {
    id: 'focus',
    label: 'Focus',
    color: 'accent',
    icon: <Target size={18} weight="fill" aria-hidden="true" />,
  },
  {
    id: 'away',
    label: 'Away',
    color: 'warning',
    icon: <Coffee size={18} weight="fill" aria-hidden="true" />,
  },
];

export const shellWorkspaces: Workspace[] = [
  { mark: 'S', name: 'Stride', org: 'Acme', teams: ['Platform', 'App', 'Design', 'All teams'] },
  { mark: 'O', name: 'Orbit', org: 'Product', teams: ['Growth', 'Core'] },
];
