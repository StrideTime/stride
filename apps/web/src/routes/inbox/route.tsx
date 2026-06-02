import { createFileRoute } from '@tanstack/react-router';

import { InboxView } from './components';

export const Route = createFileRoute('/inbox')({
  component: InboxView,
});
