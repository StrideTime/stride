import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router';
import * as PhosphorIcons from '@phosphor-icons/react';
import { AppShell, type AppShellText, type ShellStatus } from '@stride/ui';
import { useTranslation } from 'react-i18next';

import '../i18n';

import { AppModeProvider } from '../components/app-mode';
import { SessionProvider } from '../components/session';
import { SpecsProvider } from '../components/specs';
import { StatusesProvider, useStatuses } from '../components/statuses';

import '@stride/ui/styles/global.css';

type PhosphorIcon = (typeof PhosphorIcons)['CircleIcon'];

const PUBLIC_PATHS = new Set(['/login', '/signup', '/onboarding']);
const showTrayInShell =
  ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false);
const SHELLLESS_PROTECTED_PATHS = new Set([
  '/workspaces/new',
  ...(showTrayInShell ? [] : ['/tray']),
]);

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

function AppProviders() {
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

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
      { title: 'Stride' },
    ],
    links: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  }),
  component: RootDocument,
});

// The root route renders the whole HTML document — TanStack Start SSR-renders this on the
// web build and prerenders it for the desktop SPA build.
function RootDocument() {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppProviders />
        <Scripts />
      </body>
    </html>
  );
}
