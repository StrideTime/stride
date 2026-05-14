import { createFileRoute } from '@tanstack/react-router';

import { BacklogPage } from '../../../components/backlog';

export const Route = createFileRoute('/_auth/backlog/actions')({
  component: BacklogActionsPage,
});

function BacklogActionsPage() {
  return <BacklogPage surface="actions" />;
}
