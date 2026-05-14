import { createFileRoute } from '@tanstack/react-router';

import { BacklogPage } from '../../../components/backlog';

export const Route = createFileRoute('/_auth/backlog/specs')({
  component: BacklogSpecsPage,
});

function BacklogSpecsPage() {
  return <BacklogPage surface="specs" />;
}
