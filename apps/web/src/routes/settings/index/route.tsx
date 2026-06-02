import { Navigate, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/')({
  component: SettingsIndexRoute,
});

function SettingsIndexRoute() {
  return <Navigate to="/settings/$sectionId" params={{ sectionId: 'my-workspace' }} replace />;
}
