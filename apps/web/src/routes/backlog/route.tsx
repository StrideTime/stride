import { Navigate, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/backlog')({
  component: BacklogIndexRoute,
});

function BacklogIndexRoute() {
  return <Navigate to="/backlog/specs" replace />;
}
