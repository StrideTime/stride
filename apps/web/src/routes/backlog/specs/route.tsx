import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router';

import { SpecsPage } from '../components/SpecsPage';

export const Route = createFileRoute('/backlog/specs')({
  component: BacklogSpecsLayout,
});

function BacklogSpecsLayout() {
  const pathname = useRouterState({ select: state => state.location.pathname });

  if (pathname === '/backlog/specs') {
    return <SpecsPage />;
  }

  return <Outlet />;
}
