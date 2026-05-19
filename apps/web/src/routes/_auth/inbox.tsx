import { createFileRoute } from '@tanstack/react-router';

import { InboxView } from '../../components/inbox';

export const Route = createFileRoute('/_auth/inbox')({
  component: InboxView,
});
