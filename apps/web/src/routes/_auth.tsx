import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@stride/ui';

import { AppModeProvider } from '../components/app-mode';
import { SessionProvider } from '../components/session';

function AuthLayout() {
  return (
    <AppModeProvider>
      <SessionProvider>
        <AppShell />
      </SessionProvider>
    </AppModeProvider>
  );
}

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});
