import { createFileRoute } from '@tanstack/react-router';

import { InsightsView } from '../../components/insights';

export const Route = createFileRoute('/_auth/insights')({
  component: InsightsPage,
});

function InsightsPage() {
  return <InsightsView />;
}
