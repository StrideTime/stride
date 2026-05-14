import { createFileRoute } from '@tanstack/react-router';

import { ActionsPage } from '../../../components/backlog/ActionsPage';

export const Route = createFileRoute('/_auth/backlog/actions')({
  component: BacklogActionsRoute,
});

function BacklogActionsRoute() {
  return <ActionsPage />;
}
