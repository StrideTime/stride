import { createFileRoute } from '@tanstack/react-router';

import { SpecsPage } from '../../../components/backlog/SpecsPage';

export const Route = createFileRoute('/backlog/specs')({
  component: BacklogSpecsRoute,
});

function BacklogSpecsRoute() {
  return <SpecsPage />;
}
