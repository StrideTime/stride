import { createFileRoute } from '@tanstack/react-router';

import { InboxView } from '../../components/inbox';

export const Route = createFileRoute('/inbox')({
  component: InboxView,
});
