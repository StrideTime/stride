import {
  ClockCountdownIcon,
  CoffeeIcon,
  HouseIcon,
  ListBulletsIcon,
  SmileyIcon,
  SquaresFourIcon,
  TargetIcon,
  TrayIcon,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';

export type NavItem = {
  to: string;
  labelKey: string;
  icon: typeof HouseIcon;
  badge?: number;
  children?: Array<{ href: string; labelKey: string; icon: typeof HouseIcon }>;
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
  { to: '/', labelKey: 'shell.nav.today', icon: HouseIcon },
  { to: '/inbox', labelKey: 'shell.nav.inbox', icon: TrayIcon, badge: 3 },
  {
    to: '/backlog/specs',
    labelKey: 'shell.nav.backlog',
    icon: SquaresFourIcon,
    badge: 7,
    children: [
      { href: '/backlog/specs', labelKey: 'shell.nav.specs', icon: SquaresFourIcon },
      { href: '/backlog/actions', labelKey: 'shell.nav.actions', icon: ListBulletsIcon },
    ],
  },
  { to: '/schedule', labelKey: 'shell.nav.schedule', icon: ClockCountdownIcon },
  ...(showTrayPreview ? [{ to: '/tray', labelKey: 'shell.nav.trayPreview', icon: ClockCountdownIcon }] : []),
];

export const defaultShellStatuses: ShellStatus[] = [
  {
    id: 'available',
    label: 'Available',
    color: 'success',
    icon: <SmileyIcon size={18} weight="fill" aria-hidden="true" />,
  },
  {
    id: 'focus',
    label: 'Focus',
    color: 'accent',
    icon: <TargetIcon size={18} weight="fill" aria-hidden="true" />,
  },
  {
    id: 'away',
    label: 'Away',
    color: 'warning',
    icon: <CoffeeIcon size={18} weight="fill" aria-hidden="true" />,
  },
];

export const shellWorkspaces: Workspace[] = [
  { mark: 'S', name: 'Stride', org: 'Acme', teams: ['Platform', 'App', 'Design', 'All teams'] },
  { mark: 'O', name: 'Orbit', org: 'Product', teams: ['Growth', 'Core'] },
];
