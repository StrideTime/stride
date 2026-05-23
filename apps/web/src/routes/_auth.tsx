import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@stride/ui';

import { AppModeProvider } from '../components/app-mode';
import { SessionProvider } from '../components/session';
import { SpecsProvider } from '../components/specs';

function AuthLayout() {
  return (
    <AppModeProvider>
      <SessionProvider>
        <SpecsProvider>
          <AppShell />
        </SpecsProvider>
      </SessionProvider>
    </AppModeProvider>
  );
}

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});
