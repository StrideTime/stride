import * as PhosphorIcons from '@phosphor-icons/react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { AppShell, type AppShellText, type ShellStatus } from '../components/AppShell';
import { useTranslation } from 'react-i18next';

import { AppModeProvider } from './app-mode';
import { SessionProvider } from './session';
import { SpecsProvider } from './specs';
import { StatusesProvider, useStatuses } from './statuses';

type PhosphorIcon = (typeof PhosphorIcons)['CircleIcon'];

const PUBLIC_PATHS = new Set(['/auth/login', '/auth/signup']);
const showTrayInShell = ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false);
const SHELLLESS_PROTECTED_PATHS = new Set(['/workspaces/new', ...(showTrayInShell ? [] : ['/tray'])]);

function resolveIcon(name: string): PhosphorIcon {
  const icons = PhosphorIcons as Record<string, unknown>;
  const icon = icons[`${name}Icon`] ?? icons[name];
  return (typeof icon === 'object' && icon !== null ? icon : PhosphorIcons.CircleIcon) as PhosphorIcon;
}

function ShellWithStatuses() {
  const { t } = useTranslation();
  const { statuses, currentStatusId, setCurrentStatus } = useStatuses();
  const shellStatuses: ShellStatus[] = statuses.map(status => {
    const Icon = resolveIcon(status.icon);

    return {
      id: status.id,
      label: status.label,
      color: status.color,
      icon: <Icon size={15} weight="fill" aria-hidden="true" />,
    };
  });

  const text: AppShellText = {
    edit: t('common.edit'),
    status: t('shell.account.status'),
    setStatusAria: t('shell.account.setStatusAria'),
    customStatusPlaceholder: t('shell.account.customStatusPlaceholder'),
    customStatusAria: t('shell.account.customStatusAria'),
    addCustomStatusAria: t('shell.account.addCustomStatusAria'),
    workspace: t('shell.account.workspace'),
    teamAria: t('shell.account.teamAria'),
    statusBadgeAria: (status: string) => t('shell.account.statusBadgeAria', { status }),
    openSettingsAria: t('shell.settings.openAria'),
    primaryNavAria: t('shell.nav.primaryAria'),
    userName: t('shell.account.userName'),
    userEmail: t('shell.account.userEmail'),
    nav: {
      'shell.nav.today': t('shell.nav.today'),
      'shell.nav.inbox': t('shell.nav.inbox'),
      'shell.nav.backlog': t('shell.nav.backlog'),
      'shell.nav.specs': t('shell.nav.specs'),
      'shell.nav.actions': t('shell.nav.actions'),
      'shell.nav.schedule': t('shell.nav.schedule'),
      'shell.nav.trayPreview': t('shell.nav.trayPreview'),
    },
  };

  return (
    <AppShell
      statuses={shellStatuses}
      currentStatusId={currentStatusId}
      onSelectStatus={setCurrentStatus}
      text={text}
    />
  );
}

function AppRouteFrame() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const isPublicRoute = PUBLIC_PATHS.has(pathname);
  const isShelllessProtectedRoute = SHELLLESS_PROTECTED_PATHS.has(pathname);

  if (isPublicRoute || isShelllessProtectedRoute) {
    return <Outlet />;
  }

  return <ShellWithStatuses />;
}

export function AppProviders() {
  return (
    <AppModeProvider>
      <StatusesProvider>
        <SessionProvider>
          <SpecsProvider>
            <AppRouteFrame />
          </SpecsProvider>
        </SessionProvider>
      </StatusesProvider>
    </AppModeProvider>
  );
}
