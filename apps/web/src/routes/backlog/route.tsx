import { Navigate, Outlet, createFileRoute, useRouterState } from '@tanstack/react-router';

export const Route = createFileRoute('/backlog')({
  component: BacklogLayout,
});

function BacklogLayout() {
  const pathname = useRouterState({ select: state => state.location.pathname });

  if (pathname === '/backlog') {
    return <Navigate to="/backlog/specs" replace />;
  }

  return <Outlet />;
}
