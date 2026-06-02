import { createFileRoute } from '@tanstack/react-router';

import { SpecView } from './components';

export const Route = createFileRoute('/backlog/specs/$specId')({
  validateSearch: (search: Record<string, unknown>) => ({
    actionId: typeof search.actionId === 'string' ? search.actionId : undefined,
  }),
  component: BacklogSpecDetailPage,
});

// Canonical spec detail route. Actions are focused with ?actionId=... so the URL keeps the
// user in the Backlog > Specs context while deep-linking to a specific action.
function BacklogSpecDetailPage() {
  const { specId } = Route.useParams();
  const { actionId } = Route.useSearch();

  return <SpecView specId={specId} focusedActionId={actionId} />;
}
