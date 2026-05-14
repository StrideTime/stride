import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/tray')({
  component: TrayPage,
});

function TrayPage() {
  return <main>Tray placeholder</main>;
}
