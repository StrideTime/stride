import { createFileRoute } from '@tanstack/react-router';
import * as PhosphorIcons from '@phosphor-icons/react';
import { AppShell, type ShellStatus } from '@stride/ui';

import { AppModeProvider } from '../components/app-mode';
import { SessionProvider } from '../components/session';
import { SpecsProvider } from '../components/specs';
import { StatusesProvider, useStatuses } from '../components/statuses';

type PhosphorIcon = (typeof PhosphorIcons)['Circle'];

function resolveIcon(name: string): PhosphorIcon {
  const icon = (PhosphorIcons as Record<string, unknown>)[name];
  return (typeof icon === 'object' && icon !== null ? icon : PhosphorIcons.Circle) as PhosphorIcon;
}

function ShellWithStatuses() {
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

  return (
    <AppShell
      statuses={shellStatuses}
      currentStatusId={currentStatusId}
      onSelectStatus={setCurrentStatus}
    />
  );
}

function AuthLayout() {
  return (
    <AppModeProvider>
      <StatusesProvider>
        <SessionProvider>
          <SpecsProvider>
            <ShellWithStatuses />
          </SpecsProvider>
        </SessionProvider>
      </StatusesProvider>
    </AppModeProvider>
  );
}

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});
