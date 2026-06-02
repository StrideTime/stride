import type { ShellStatus } from './AppShell.data';

export type AppShellText = {
  edit: string;
  status: string;
  setStatusAria: string;
  customStatusPlaceholder: string;
  customStatusAria: string;
  addCustomStatusAria: string;
  workspace: string;
  teamAria: string;
  statusBadgeAria: (status: string) => string;
  openSettingsAria: string;
  primaryNavAria: string;
  userName: string;
  userEmail: string;
  nav: Record<string, string>;
};

export type AppShellProps = {
  statuses?: ShellStatus[];
  currentStatusId?: string;
  onSelectStatus?: (id: string) => void;
  text: AppShellText;
};
