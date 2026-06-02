import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

// Placeholder. v1 auth is invite-only (Better Auth) — see docs/product/mvp.md.
function LoginPage() {
  return <main>Login — placeholder</main>;
}
