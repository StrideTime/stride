import { createFileRoute } from '@tanstack/react-router';

import { SpecsPage } from '../../../components/backlog/SpecsPage';

export const Route = createFileRoute('/_auth/backlog/specs')({
  component: BacklogSpecsRoute,
});

function BacklogSpecsRoute() {
  return <SpecsPage />;
}
