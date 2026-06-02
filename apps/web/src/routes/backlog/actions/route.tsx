import { createFileRoute } from '@tanstack/react-router';

import { ActionsPage } from '../components/ActionsPage';

export const Route = createFileRoute('/backlog/actions')({
  component: BacklogActionsRoute,
});

function BacklogActionsRoute() {
  return <ActionsPage />;
}
