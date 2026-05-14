import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@stride/ui';

export const Route = createFileRoute('/_auth')({
  component: AppShell,
});
