import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

// Placeholder. Connect Jira / Linear / Google Calendar → pick projects → first sync → land on Today.
// Whether this is a gated route before the app shell or a step inside it is open (open-questions Q11).
function OnboardingPage() {
  return <main>Onboarding — placeholder</main>;
}
