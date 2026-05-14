import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/backlog')({
  component: BacklogLayout,
});

function BacklogLayout() {
  return <Outlet />;
}
